import 'should';
import { MessageStandardType } from '@bitgo/sdk-core';
import { testEthMessageBuilding } from '../abstractEthMessageBuilderTests';
import { EIP191Message, Eip191MessageBuilder } from '../../../../src';
import { eip191Fixtures as fixtures } from '../fixtures';

describe('EIP191 Message Builder', () => {
  const midnightMessage = { ...fixtures.messages.midnight, ...fixtures.signing.midnight };
  const simpleMessage = { ...fixtures.messages.validMessage, ...fixtures.signing };
  testEthMessageBuilding(
    MessageStandardType.EIP191,
    Eip191MessageBuilder,
    EIP191Message,
    midnightMessage,
    simpleMessage
  );
});
