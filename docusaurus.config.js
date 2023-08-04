// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const docusuarus_docs = [
  // {
  //////   name: "aw-api-dao",
  //   repo: "aw-api-dao",
  // out_dir: "aw-api-dao",
  // },
  // {
  //////   name: "aw-history",
  //   repo: "aw-history",
  // out_dir: "Components/aw-history",
  // },
  {
    name: "aw-history-dao",
    repo: "aw-history-dao",
    out_dir: "01-aw-history-dao",
    baseUrl: "https://raw.githubusercontent.com/Alien-Worlds/aw-history-dao/main/",
    docs: ["README.md"]
  },
  {
    name: "aw-history-starter-kit",
    repo: "aw-history-starter-kit",
    baseUrl: "https://raw.githubusercontent.com/Alien-Worlds/aw-history-starter-kit/main/",
    out_dir: "02-Components/01-aw-api-history-starter-kit",
    docs: ["README.md"]
  },
  {
    name: "aw-history-starter-kit-tutorials",
    repo: "aw-history-starter-kit",
    baseUrl: "https://raw.githubusercontent.com/Alien-Worlds/aw-history-starter-kit/main/tutorials/",
    out_dir: "02-Components/01-aw-api-history-starter-kit/tutorials",
    docs: ['using-history-tools-starter-kit.md', 'config-vars.md']
  },
  {
    name: "aw-core",
    repo: "aw-core",
    baseUrl: "https://raw.githubusercontent.com/Alien-Worlds/aw-core/main/",
    out_dir: "02-Components/02-aw-core",
    docs: ["README.md"]
  },
  {
    name: "aw-storage-mongodb",
    repo: "aw-storage-mongodb",
    baseUrl: "https://raw.githubusercontent.com/Alien-Worlds/aw-storage-mongodb/main/",
    out_dir: "02-Components/03-aw-storage-mongodb",
    docs: ["README.md"]
  },
  {
    name: "aw-antelope",
    repo: "aw-antelope",
    out_dir: "02-Components/04-aw-antelope",
    docs: ["README.md"]
  },
  {
    name: "aw-workers",
    repo: "aw-workers",
    out_dir: "02-Components/05-aw-workers",
    docs: ["README.md"]
  },
  {
    name: "aw-broadcast",
    repo: "aw-broadcast",
    out_dir: "02-Components/06-aw-broadcast",
    docs: ["README.md"]
  },
  // // // {
  //   name: "aliengen",
  //   repo: "aliengen",
  // out_dir: "02-Components/aliengen",
  // },

]
  .map((input, idx) => ([
    "docusaurus-plugin-remote-content",
    {
      name: input.name, // used by CLI, must be path safe
      sourceBaseUrl: input.baseUrl || `https://raw.githubusercontent.com/Alien-Worlds/${input.repo}/master/`,
      outDir: `docs/03-API tools/${input.out_dir}`, // the base directory to output to.
      documents: input.docs || ["README.md"], // the file names to download
      performCleanup: false, // removes the downloaded files after generation,
      modifyContent: (filename, content) => {
        let lines = content.split("\n")
        lines.splice(1, 0, `\n### [Source](https://github.com/Alien-Worlds/${input.repo})`)
        content = lines.join("\n")

        content = content.replace("## License\n\n", "")
        content = content.replace("This project is licensed under the terms of the MIT license. For more information, refer to the [LICENSE](./LICENSE) file.\n", "")
        return { filename, content }
      }
    },
  ]))

console.log(JSON.stringify(docusuarus_docs, null, 2));

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Alien Worlds Smart Contracts',
  tagline: 'DAOs Everywhere',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-test-site.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'alienworlds', // Usually your GitHub org/user name. 
  // projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
  },
  plugins: [
    ...docusuarus_docs,
  ],
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          // sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        // {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/alienworlds-logo.webp',
      navbar: {
        title: 'Alien Worlds Docs',
        logo: {
          alt: 'Alien Worlds Logo',
          src: 'img/alienworlds-logo.png',
        },
        items: [
          // {
          //   type: 'doc',
          //   docId: 'overview',
          //   position: 'left',
          //   label: 'Tutorial',
          // },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/Alien-Worlds/docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Smart Contracts',
                to: '/Antelope%20smart-contracts/',
              },

            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Telegram',
                href: 'https://t.me/AlienWorldsOffical',
              },
              {
                label: 'Discord',
                href: 'https://discord.io/alienworldsofficial',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/alienworlds',
              },
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/alienworlds.io/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/alienworlds/docs',
              },
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()
        // } Alien Worlds`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      mermaid: {
        options: {
          diagramMarginX: 20,
          diagramMarginY: 30,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
          mirrorActors: false,
        }
      }
    }),
};

module.exports = config;
