import 'should';
import { EIP712Message } from '../../../../src/';
import { eip712Fixtures as fixtures } from '../fixtures';
import { MessageStandardType } from '@bitgo/sdk-core';
import { testEthMessageSigning } from '../abstractEthMessagesTests';

describe('EIP712 Message', () => {
  const messages = Object.fromEntries(
    Object.entries(fixtures.messages).map(([key, value]) => [key, { ...value, payload: JSON.stringify(value.payload) }])
  );

  const messagesWithSigningData = {
    ...fixtures.messages.simple,
    payload: JSON.stringify(fixtures.messages.simple.payload),
    signature: fixtures.signing.signature,
    signer: fixtures.signing.signer,
  };

  testEthMessageSigning(MessageStandardType.EIP712, EIP712Message, messages, messagesWithSigningData);
});
