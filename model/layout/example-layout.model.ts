import { GoldenLayoutConfig, LayoutItemType } from './layout.model';

type ExamplePanelMetaKey = 'title' | 'filename';

export const initLayoutConfig: GoldenLayoutConfig<ExamplePanelMetaKey> = {
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
