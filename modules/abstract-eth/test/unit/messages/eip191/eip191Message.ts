import 'should';
import { MessageStandardType } from '@bitgo/sdk-core';
import { eip191Fixtures as fixtures } from '../fixtures';
import { EIP191Message } from '../../../../src';
import { testEthMessageSigning } from '../abstractEthMessagesTests';

describe('EIP191 Message', () => {
  const messageWithSigningData = {
    ...fixtures.messages.validMessage,
    signature: fixtures.signing.signature,
    signer: fixtures.signing.signer,
  };

  testEthMessageSigning(MessageStandardType.EIP191, EIP191Message, fixtures.messages, messageWithSigningData);
});
