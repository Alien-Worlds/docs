import React from 'react';

export default function BlockExplorerLinks({ contract }) {
    return (<span>
        <a href={"https://wax.bloks.io/account/" + contract} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
            border_radius: '25px'
        }}>
            <img src="https://bloks.io/img/bloks_logomark_white.svg" width="30px" height="25px" />
        </a>
        <span style={{
            padding: '0.2rem',
        }} />
        <a href={"https://waxblock.io/account/" + contract} style={{
            backgroundColor: 'green',
            padding: '0.2rem',
        }}>
            <img src="https://waxblock.io/common/images/wax-block-footer-logo.png" width="110px" height="25px" />
        </a>
    </span>)
};