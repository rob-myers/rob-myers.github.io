import { GoldenLayoutConfig, LayoutItemType } from './layout.model';

export type CustomPanelMetaKey = 'title' | 'filename';

export const initLayoutConfig: GoldenLayoutConfig<CustomPanelMetaKey> = {
  settings: {
    showPopoutIcon: false,
    popoutWholeStack: false,
  },
  dimensions: {
    borderWidth: 1,
    minItemWidth: 200,
    minItemHeight: 200,
    dragProxyWidth: 200,
    dragProxyHeight: 100,
  },
  content: [{
    type: LayoutItemType.column,
    content: [
      {
        type: LayoutItemType.row,
        content: [
          {
            type: LayoutItemType.stack,
            content: [
              {
                type: LayoutItemType['react-component'],
                title: 'Tsx editor',
                component: 'window-panel',
                props: {
                  panelKey: 'tsx',
                  panelMeta: {
                    filename: 'index.tsx',
                  },
                },
              },
              {
                type: LayoutItemType['react-component'],
                title: 'index.scss',
                component: 'window-panel',
                props: {
                  panelKey: 'scss',
                  panelMeta: {
                    filename: 'index.scss',
                  },
                },
              },
              {
                type: LayoutItemType['react-component'],
                title: 'reducer.ts',
                component: 'window-panel',
                props: {
                  panelKey: 'ts',
                  panelMeta: {
                    filename: 'reducer.ts',
                  },
                },
              },
            ],
          },
          {
            type: LayoutItemType['react-component'],
            title: 'App',
            component: 'window-panel',
            props: {
              panelKey: 'app',
              panelMeta: {
                //
              },
            },
          },
        ],
      }
    ],

  }],
};

export const initLayoutConfig2: GoldenLayoutConfig<CustomPanelMetaKey> = {
  settings: {
    showPopoutIcon: false,
    popoutWholeStack: false,
    // selectionEnabled: true,
    // constrainDragToContainer: true,
  },
  dimensions: {
    borderWidth: 1,
    minItemWidth: 200,
    // minItemWidth: 100,
    dragProxyWidth: 200,
    dragProxyHeight: 100,
  },
  content: [
    {
      type: LayoutItemType.row,
      content: [
        {
          type: LayoutItemType['react-component'],
          title: 'From da left',
          component: 'window-panel',
          props: {
            panelKey: 'far-left',
          },
        },
        {
          type: LayoutItemType.column,
          content: [
            {
              type: LayoutItemType['react-component'],
              title: 'Top middle',
              component: 'window-panel',
              props: {
                panelKey: 'middle-top',
              },
            },
            {
              type: LayoutItemType.stack,
              content: [
                {
                  type: LayoutItemType['react-component'],
                  title: '1',
                  component: 'window-panel',
                  props: {
                    panelKey: 'middle-bottom-1',
                  },
                },
                {
                  type: LayoutItemType['react-component'],
                  title: '2',
                  component: 'window-panel',
                  props: {
                    panelKey: 'middle-bottom-2',
                  },
                },
                {
                  type: LayoutItemType['react-component'],
                  title: '3',
                  component: 'window-panel',
                  props: {
                    panelKey: 'middle-bottom-3',
                  },
                },
              ],
            }
          ],
        },
        // {
        //   type: LayoutItemType['react-component'],
        //   title: "To the right!",
        //   component: "window-panel",
        //   props: {
        //     panelKey: 'far-right',
        //   },
        // },
      ]
    },
  ],
};
