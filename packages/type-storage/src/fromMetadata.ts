// Copyright 2017-2018 @polkadot/storage authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { ModuleStorage, Storage } from './types';

import Metadata from '@polkadot/types/Metadata';
import { stringLowerFirst } from '@polkadot/util';

import createFunction from './utils/createFunction';
import storage from './index';

/**
 * Extend a storage object with the storage modules & module functions present
 * in the metadata.
 *
 * @param storage - A storage object to be extended.
 * @param metadata - The metadata to extend the storage object against.
 */
export default function fromMetadata (metadata: Metadata): Storage {
  const result = Object.keys(storage).reduce((result, key) => {
    result[key] = storage[key];

    return result;
  }, {} as Storage);

  return metadata.modules.reduce((result, moduleMetadata) => {
    if (moduleMetadata.storage.isNone) {
      return result;
    }

    const prefix = moduleMetadata.storage.unwrap().prefix;

    // For access, we change the index names, i.e. Balances.FreeBalance -> balances.freeBalance
    result[stringLowerFirst(prefix.toString())] = moduleMetadata.storage.unwrap().functions.reduce((newModule, func) => {
      newModule[stringLowerFirst(func.name.toString())] = createFunction(prefix, func.name, func);

      return newModule;
    }, {} as ModuleStorage);

    return result;
  }, result);
}
