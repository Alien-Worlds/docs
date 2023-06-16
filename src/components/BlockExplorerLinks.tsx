import React from 'react';
import ThemedImage from '@theme/ThemedImage';

function BlockchainLink({ url, dark_image, light_image }) {
  return (
    <a
      href={url}
      target="_blank"
      style={{
        margin: '5px',
      }}
    >
      <ThemedImage
        sources={{
          dark: dark_image,
          light: light_image,
        }}
        width="25px"
        height="25px"
        // style={{
        //   width: '15%',
        //   aspectRatio: '1/1',
        //   objectFit: 'contain',
        //   mixBlendMode: 'color-burn',
        // }}
      />
    </a>
  );
}

export function BlockExplorerContractLinks({ contract }) {
  return (
    <span>
      Blockchain: <code>{`${contract}`}</code>
      <BlockchainLink
        url={`https://wax.bloks.io/account/${contract}`}
        light_image={'/img/bloks_logomark_dark.png'}
        dark_image={'/img/bloks_logomark_white.png'}
      />
      {/* <BlockchainLink
        url={`https://eosauthority.com/account/${contract}?network=wax`}
        light_image={'/img/EOS_AUTHORITY_LOGO.png'}
        dark_image={'/img/EOS_AUTHORITY_LOGO.png'}
      /> */}
      <BlockchainLink
        url={`https://waxblock.io/account/${contract}`}
        light_image={'/img/waxblocks-logo.png'}
        dark_image={'/img/waxblocks-logo.png'}
      />
    </span>
  );
}

//https://eosauthority.com/account/m.federation?network=wax&action=claimmines

export function BlockExplorerActionLinks({ contract, action }) {
  return (
    <span>
      <code>{`${contract}::${action}`}</code>
      <BlockchainLink
        url={`https://wax.bloks.io/account/${contract}?loadContract=true&tab=Actions&action=${action}`}
        light_image={'/img/bloks_logomark_dark.png'}
        dark_image={'/img/bloks_logomark_white.png'}
      />
      {/* <BlockchainLink
        url={`https://eosauthority.com/account/${contract}?network=wax&action=${action}`}
        light_image={'/img/EOS_AUTHORITY_LOGO.png'}
        dark_image={'/img/EOS_AUTHORITY_LOGO.png'}
      /> */}
      <BlockchainLink
        url={`https://waxblock.io/account/${contract}?action=${action}#contract-actions`}
        light_image={'/img/waxblocks-logo.png'}
        dark_image={'/img/waxblocks-logo.png'}
      />
    </span>
  );
}

export function BlockExplorerTableLinks({ contract, table }) {
  return (
    <span>
      <code>{`${contract}::${table}`}</code>

      <BlockchainLink
        url={`https://wax.bloks.io/account/${contract}?loadContract=true&tab=Tables&table=${table}&limit=100`}
        light_image={'/img/bloks_logomark_dark.png'}
        dark_image={'/img/bloks_logomark_white.png'}
      />
      {/* <BlockchainLink
        url={`https://eosauthority.com/account/${contract}?network=wax&scope=${contract}&table=${table}&limit=10&index_position=1&key_type=i64&reverse=0&mode=contract&sub=tables`}
        light_image={'/img/EOS_AUTHORITY_LOGO.png'}
        dark_image={'/img/EOS_AUTHORITY_LOGO.png'}
      /> */}
      <BlockchainLink
        url={`https://waxblock.io/account/${contract}?&table=${table}#contract-tables`}
        light_image={'/img/waxblocks-logo.png'}
        dark_image={'/img/waxblocks-logo.png'}
      />
    </span>
  );
}
