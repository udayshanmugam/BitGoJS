import {
  BaseMessage,
  BaseMessageBuilder,
  BroadcastableMessage,
  MessageMetadata,
  MessageStandardType,
  serializeSignatures,
  Signature,
} from '@bitgo/sdk-core';
import { coins } from '@bitgo/statics';
import { MessageBuilderFactory } from '../../../src';

type MessageConstructionData = { payload: string; metadata?: MessageMetadata; signer: string; signature: Signature };
type MessageValidationData = { hex: string };
type MessageValidationDataWithBroadcastHex = MessageValidationData & { broadcastHex: string };

const coinConfig = coins.get('eth');

export function testEthMessageBuilding(
  messageType: MessageStandardType,
  messageBuilderType: typeof BaseMessageBuilder,
  expectedMessageType: typeof BaseMessage,
  messageDataWithBroadcast: MessageConstructionData & MessageValidationDataWithBroadcastHex,
  messageData?: MessageConstructionData & MessageValidationData
): void {
  testBuildMethod(messageType, messageBuilderType, messageData || messageDataWithBroadcast);
  testFromBroadcastFormat(messageType, expectedMessageType, messageData || messageDataWithBroadcast);
  testFromBroadcastString(messageType, messageDataWithBroadcast);
}

function testBuildMethod(
  messageType: MessageStandardType,
  messageBuilderType: typeof BaseMessageBuilder,
  messageData: MessageConstructionData & MessageValidationData
): void {
  describe(`${messageType} - Build Method`, () => {
    const factory = new MessageBuilderFactory(coinConfig);
    const { payload, metadata, signature, signer } = messageData;

    it('should initialize with the correct message type', () => {
      const builder = factory.getMessageBuilder(messageType);
      builder.should.be.instanceof(messageBuilderType);
    });

    it('should build a valid message', async () => {
      const builder = factory.getMessageBuilder(messageType);
      builder.setPayload(payload).setMetadata(metadata || {});

      const builtMessage = await builder.build();
      builtMessage.getType().should.equal(messageType);
      builtMessage.getPayload().should.equal(messageData.payload);

      if (metadata) {
        builtMessage.getMetadata()?.should.not.be.empty();
        builtMessage.getMetadata()?.should.deepEqual(metadata);
      } else {
        builtMessage.getMetadata()?.should.be.empty();
      }
    });

    it('should throw an error when building without setting the payload', async () => {
      const builder = factory.getMessageBuilder(messageType);
      await builder.build().should.be.rejectedWith('Message payload must be set before building the message');
    });

    it('should include signers when building a message', async () => {
      const builder = factory.getMessageBuilder(messageType);
      builder.setPayload(payload);
      builder.addSigner(signer);

      const message = await builder.build();
      message.getSigners().should.containEql(signer);
    });

    it('should include signatures when building a message', async () => {
      const builder = factory.getMessageBuilder(messageType);
      builder.setPayload(payload);
      builder.addSignature(signature);

      const message = await builder.build();
      message.getSignatures().should.containEql(signature);
    });

    it('should override metadata.encoding with utf8', async () => {
      const builder = factory.getMessageBuilder(messageType);
      builder.setPayload(payload);
      builder.setMetadata({ encoding: 'hex', customData: 'test data' });

      const message = await builder.build();
      message.getMetadata()?.should.have.property('encoding', 'utf8');
      message.getMetadata()?.should.have.property('customData', 'test data');
    });
  });
}

const testFromBroadcastFormat = (
  messageType: MessageStandardType,
  expectedMessageType: typeof BaseMessage,
  messageData: MessageConstructionData & MessageValidationData
) => {
  const factory = new MessageBuilderFactory(coinConfig);
  const { payload, signature, signer, metadata } = messageData;

  const createBroadcastMessage = () => {
    return {
      payload,
      type: messageType,
      serializedSignatures: serializeSignatures([signature]),
      signers: [signer],
      metadata: metadata,
    } as BroadcastableMessage;
  };

  describe(`${messageType} - From Broadcast Format`, () => {
    it('should reconstruct a message from broadcast format', async () => {
      const builder = factory.getMessageBuilder(messageType);
      const message = await builder.fromBroadcastFormat(createBroadcastMessage());

      message.getType().should.equal(messageType);
      message.getPayload().should.equal(payload);
      message.getSignatures().should.containEql(signature);
      message.getSigners().should.containEql(signer);

      message.should.be.instanceof(expectedMessageType);
      message.getMetadata()?.should.deepEqual(metadata || {});
    });

    it('should throw an error for incorrect message type', async () => {
      const builder = factory.getMessageBuilder(messageType);
      const broadcastMessageWrongType = { ...createBroadcastMessage(), type: MessageStandardType.UNKNOWN };
      await builder
        .fromBroadcastFormat(broadcastMessageWrongType)
        .should.be.rejectedWith(`Invalid message type, expected ${messageType}`);
    });
  });
};

const testFromBroadcastString = (
  messageType: MessageStandardType,
  messageDataWithBroadcast: MessageConstructionData & MessageValidationDataWithBroadcastHex
) => {
  const { payload, signature, signer, broadcastHex } = messageDataWithBroadcast;

  describe(`${messageType} - From Broadcast String`, () => {
    it('should parse broadcastable string and return correct builder type', async () => {
      const factory = new MessageBuilderFactory(coinConfig);
      const builder = factory.fromBroadcastString(broadcastHex);
      const message = await builder.build();

      message.getType().should.equal(messageType);
      message.getPayload().should.equal(payload);
      message.getSignatures().should.containEql(signature);
      message.getSigners().should.containEql(signer);
    });
  });
};
