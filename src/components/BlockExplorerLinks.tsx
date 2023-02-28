import React from 'react';

export function BlockExplorerContractLinks({ contract }) {
    return (<span>
        <a href={"https://wax.bloks.io/account/" + contract} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
            border_radius: '25px',
        }}>
            <img src="/img/bloks_logomark_white.png" width="25px" height="25px" />
        </a>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={"https://waxblock.io/account/" + contract} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
        }}>
            <img src="/img/waxblocks-logo.png" width="25px" height="25px" />
        </a>
    </span>)
};

export function BlockExplorerActionLinks({ contract, action }) {
    return (<span>
        <code>{`${contract}::${action}`}</code>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={`https://wax.bloks.io/account/${contract}?loadContract=true&tab=Actions&action=${action}`} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
            border_radius: '25px',
        }}>
            <img src="/img/bloks_logomark_white.png" width="25px" height="25px" />
        </a>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={`https://waxblock.io/account/${contract}?action=${action}#contract-actions`} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
        }}>
            <img src="/img/waxblocks-logo.png" width="25px" height="25px" />
        </a>
    </span>)
};

export function BlockExplorerTableLinks({ contract, table }) {
    return (<span>
        <code>{`${contract}::${table}`}</code>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={`https://wax.bloks.io/account/${contract}?loadContract=true&tab=Tables&table=${table}&limit=100`} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
            border_radius: '25px',
        }}>
            <img src="/img/bloks_logomark_white.png" width="25px" height="25px" />
        </a>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={`https://waxblock.io/account/${contract}?&table=${table}#contract-tables`} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
        }}>
            <img src="/img/waxblocks-logo.png" width="25px" height="25px" />
        </a>
    </span>)
};