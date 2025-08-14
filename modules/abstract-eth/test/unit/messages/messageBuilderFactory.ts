import 'should';
import { MessageStandardType } from '@bitgo/sdk-core';
import { eip191Fixtures, eip712Fixtures } from './fixtures';
import { Eip191MessageBuilder, Eip712MessageBuilder, MessageBuilderFactory } from '../../../src';
import { coins } from '@bitgo/statics';

describe('Message Builder Factory', () => {
  const coinConfig = coins.get('eth');

  describe('getMessageBuilder', () => {
    it('should return the correct builder for EIP191 message type', () => {
      const factory = new MessageBuilderFactory(coinConfig);

      const builder = factory.getMessageBuilder(MessageStandardType.EIP191);
      builder.should.be.instanceof(Eip191MessageBuilder);
    });

    it('should return the correct builder for EIP712 message type', () => {
      const factory = new MessageBuilderFactory(coinConfig);

      const builder = factory.getMessageBuilder(MessageStandardType.EIP712);
      builder.should.be.instanceof(Eip712MessageBuilder);
    });

    it('should throw an error for unsupported message types', () => {
      const factory = new MessageBuilderFactory(coinConfig);

      // Test with an invalid/unsupported message type
      const unsupportedType = 'UNSUPPORTED_TYPE' as MessageStandardType;

      (() => factory.getMessageBuilder(unsupportedType)).should.throw(/Invalid message standard/);
    });

    it('should throw for unknown message standard', () => {
      const factory = new MessageBuilderFactory(coinConfig);

      (() => factory.getMessageBuilder(MessageStandardType.UNKNOWN)).should.throw(
        `Invalid message standard ${MessageStandardType.UNKNOWN}`
      );
    });
  });

  describe('Integration with builder', () => {
    it('should create a builder that can build a valid EIP191 message', async () => {
      const factory = new MessageBuilderFactory(coinConfig);

      const builder = factory.getMessageBuilder(MessageStandardType.EIP191);
      builder.setPayload(eip191Fixtures.messages.validMessage.payload);

      const message = await builder.build();
      message.getType().should.equal(MessageStandardType.EIP191);
      message.getPayload().should.equal(eip191Fixtures.messages.validMessage.payload);
    });

    it('should create a builder that can build a valid EIP712 message', async () => {
      const factory = new MessageBuilderFactory(coinConfig);

      const builder = factory.getMessageBuilder(MessageStandardType.EIP712);
      builder.setPayload(JSON.stringify(eip712Fixtures.messages.simple.payload));

      const message = await builder.build();
      message.getType().should.equal(MessageStandardType.EIP712);
      JSON.parse(message.getPayload()).should.deepEqual(eip712Fixtures.messages.simple.payload);
    });
  });
});
