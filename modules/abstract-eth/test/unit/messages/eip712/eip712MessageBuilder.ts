import 'should';
import { EIP712Message, Eip712MessageBuilder } from '../../../../src';
import { eip712Fixtures as fixtures } from '../fixtures';
import { MessageStandardType } from '@bitgo/sdk-core';
import { testEthMessageBuilding } from '../abstractEthMessageBuilderTests';

describe('EIP712 Message Builder', () => {
  const simpleMessage = {
    ...fixtures.messages.simple,
    ...fixtures.signing,
    payload: JSON.stringify(fixtures.messages.simple.payload),
  };
  testEthMessageBuilding(MessageStandardType.EIP712, Eip712MessageBuilder, EIP712Message, simpleMessage);
});
