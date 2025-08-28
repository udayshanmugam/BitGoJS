import { tadaToken } from '../account';
import { UnderlyingAsset } from '../base';
import { ADA_TOKEN_FEATURES } from '../coinFeatures';

export const adaTokens = [
  tadaToken(
    'de55cb4b-afaf-4ac0-b271-d7eba49eb8e9',
    'tada:water',
    'Test ADA Token',
    6,
    '2533cca6eb42076e144e9f2772c390dece9fce173bc38c72294b3924',
    'WATER',
    UnderlyingAsset['tada:water'],
    ADA_TOKEN_FEATURES
  ),
];
