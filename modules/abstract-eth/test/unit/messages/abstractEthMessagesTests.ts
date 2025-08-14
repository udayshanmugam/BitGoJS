import {
  BaseMessage,
  MessageMetadata,
  MessageOptions,
  MessageStandardType,
  serializeSignatures,
  Signature,
} from '@bitgo/sdk-core';
import { coins } from '@bitgo/statics';

type MessageCtor = new (options: MessageOptions) => BaseMessage;
type MessageConstructionData = { payload: string; metadata?: MessageMetadata };
type MessageConstructionDataWithSigning = MessageConstructionData & { signature: Signature; signer: string };
type MessageValidationData = { hex: string };
type MessageValidationDataWithBase64 = MessageValidationData & { base64: string };

const coinConfig = coins.get('eth');

export function testEthMessageSigning(
  messageType: MessageStandardType,
  messageCtor: MessageCtor,
  messages: Record<string, MessageConstructionData & MessageValidationData>,
  messageWithSigningData: MessageConstructionDataWithSigning & MessageValidationDataWithBase64
): void {
  testMessageHasCorrectType(messageType, messageCtor, messageWithSigningData);
  testSignablePayloadGeneration(messageType, messageCtor, messages);
  testMaintainingSignersAndSignatures(messageType, messageCtor, messageWithSigningData);
  testBroadcastFormat(messageType, messageCtor, messageWithSigningData);
}

function testMessageHasCorrectType(
  messageType: MessageStandardType,
  messageCtor: MessageCtor,
  message: MessageConstructionData & MessageValidationData
): void {
  describe(`${messageType} - Message Type`, () => {
    it('should have the correct message type', () => {
      const msgInstance = new messageCtor({
        ...message,
        coinConfig,
      });
      msgInstance.getType().should.equal(messageType);
    });
  });
}

function testSignablePayloadGeneration(
  messageType: MessageStandardType,
  messageCtor: MessageCtor,
  messages: Record<string, MessageConstructionData & MessageValidationData>
): void {
  describe(`${messageType} - Signable Payload Generation`, () => {
    Object.entries(messages).map(([key, { payload, hex, metadata }]) => {
      it(`should generate the correct signable payload for message '${key}'`, async () => {
        const message = new messageCtor({
          payload,
          coinConfig,
          metadata,
        });

        const signablePayload = await message.getSignablePayload();
        signablePayload.toString('hex').should.equal(hex);

        if (metadata) {
          message.getMetadata()?.should.not.be.empty();
          message.getMetadata()?.should.deepEqual(metadata);
        } else {
          message.getMetadata()?.should.be.empty();
        }
      });
    });
  });
}

function testMaintainingSignersAndSignatures(
  messageType: MessageStandardType,
  messageCtor: MessageCtor,
  messageWithSigningData: MessageConstructionDataWithSigning & MessageValidationDataWithBase64
): void {
  describe(`${messageType} - Maintaining Signers and Signatures`, () => {
    const { payload, signature, signer } = messageWithSigningData;

    it('should be created with the correct signatures and signers', () => {
      const message = new messageCtor({
        coinConfig,
        payload,
        signatures: [signature],
        signers: [signer],
      });

      message.getSignatures().should.containEql(signature);
      message.getSigners().should.containEql(signer);
    });

    it('should maintain signatures and signers correctly', () => {
      const message = new messageCtor({
        coinConfig,
        payload,
        signatures: [signature],
        signers: [signer],
      });

      message.addSignature({
        publicKey: { pub: 'pub1' },
        signature: Buffer.from('new-signature'),
      });
      message.addSigner('new-signer');

      message.getSignatures().should.containEql({
        publicKey: { pub: 'pub1' },
        signature: Buffer.from('new-signature'),
      });
      message.getSigners().should.containEql('new-signer');

      // Test replacing all
      message.setSignatures([
        {
          publicKey: { pub: 'pub2' },
          signature: Buffer.from('replaced-signature'),
        },
      ]);
      message.setSigners(['replaced-signer']);

      message.getSignatures().should.deepEqual([
        {
          publicKey: { pub: 'pub2' },
          signature: Buffer.from('replaced-signature'),
        },
      ]);
      message.getSigners().should.deepEqual(['replaced-signer']);
    });
  });
}

function testBroadcastFormat(
  messageType: MessageStandardType,
  messageCtor: MessageCtor,
  messageWithSigningData: MessageConstructionDataWithSigning & MessageValidationDataWithBase64
): void {
  describe(`${messageType} - Broadcast Format`, () => {
    const { payload, signature, signer, base64 } = messageWithSigningData;

    it('should convert to broadcast format correctly', async () => {
      const message = new messageCtor({
        coinConfig,
        payload,
        signatures: [signature],
        signers: [signer],
      });

      const broadcastFormat = await message.toBroadcastFormat();
      const expectedSerializedSignatures = serializeSignatures([signature]);

      broadcastFormat.type.should.equal(messageType);
      broadcastFormat.payload.should.equal(message.getPayload());
      broadcastFormat.serializedSignatures?.should.deepEqual(expectedSerializedSignatures);
      broadcastFormat.signers?.should.deepEqual([signer]);
      broadcastFormat.metadata?.should.deepEqual(message.getMetadata());
      broadcastFormat.signablePayload?.should.equal(base64);
    });

    it('should convert to broadcast string correctly', async () => {
      const message = new messageCtor({
        coinConfig,
        payload,
        signatures: [signature],
        signers: [signer],
      });

      const broadcastHex = await message.toBroadcastString();
      const broadcastString = Buffer.from(broadcastHex, 'hex').toString();
      const parsedBroadcast = JSON.parse(broadcastString);
      const expectedSerializedSignatures = serializeSignatures([signature]);

      parsedBroadcast.type.should.equal(messageType);
      parsedBroadcast.payload.should.equal(message.getPayload());
      parsedBroadcast.serializedSignatures.should.deepEqual(expectedSerializedSignatures);
      parsedBroadcast.signers.should.deepEqual([signer]);
      parsedBroadcast.metadata.should.deepEqual(message.getMetadata());
    });
  });
}
