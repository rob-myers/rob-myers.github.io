import { GoldenLayoutConfig, traverseGlConfig } from './layout.model';
import { deepClone } from '@model/generic.model';
import { rootAppFilename } from '@model/dev-env/dev-env.model';

export type CustomPanelMetaKey = 'title' | 'filename' | 'devEnvComponent';

const defaultMobileConfig: GoldenLayoutConfig<CustomPanelMetaKey> = {
  'settings': {
    'hasHeaders': true,
    'constrainDragToContainer': false,
    'reorderEnabled': true,
    'selectionEnabled': false,
    'popoutWholeStack': false,
    'blockedPopoutsThrowError': true,
    'closePopoutsOnUnload': true,
    'showPopoutIcon': false,
    'showMaximiseIcon': true,
    'showCloseIcon': true,
    'responsiveMode': 'onload',
    'tabOverlapAllowance': 0,
    'reorderOnTabMenuClick': true,
    'tabControlOffset': 10
  },
  'dimensions': {
    'borderWidth': 1,
    'borderGrabWidth': 15,
    'minItemHeight': 200,
    'minItemWidth': 200,
    'headerHeight': 20,
    'dragProxyWidth': 200,
    'dragProxyHeight': 100
  },
  'labels': {
    'close': 'close',
    'maximise': 'maximise',
    'minimise': 'minimise',
    'popout': 'open in new window',
    'popin': 'pop in',
    'tabDropdown': 'additional tabs'
  },
  'content': [
    {
      'type': 'column',
      'title': '',
      'isClosable': true,
      'reorderEnabled': true,
      'content': [
        {
          'type': 'column',
          'isClosable': true,
          'reorderEnabled': true,
          'title': '',
          'width': 100,
          'height': 100,
          'content': [
            {
              'type': 'stack',
              'title': '',
              'width': 50,
              'activeItemIndex': 0,
              'isClosable': true,
              'reorderEnabled': true,
              'height': 42.69535673839185,
              'content': [
                {
                  'type': 'component',
                  'title': 'app.tsx',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-1',
                    'panelMeta': {
                      'filename': 'app.tsx'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'reducer.ts',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-2',
                    'panelMeta': {
                      'filename': 'reducer.ts'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'store/test.duck.ts',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-2b',
                    'panelMeta': {
                      'filename': 'store/test.duck.ts'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                }
              ]
            },
            {
              'type': 'stack',
              'header': {},
              'isClosable': true,
              'reorderEnabled': true,
              'title': '',
              'activeItemIndex': 0,
              'height': 57.304643261608156,
              'content': [
                {
                  'type': 'component',
                  'title': 'App',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-3',
                    'panelMeta': {
                      'devEnvComponent': 'App'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'index.scss',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-4',
                    'panelMeta': {
                      'filename': 'index.scss'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'other.scss',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-5',
                    'panelMeta': {
                      'filename': 'other.scss'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'module/core/redux.model.ts',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-2a',
                    'panelMeta': {
                      'filename': 'module/core/redux.model.ts'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                },
                {
                  'type': 'component',
                  'title': 'module/core/util.ts',
                  'component': 'window-panel',
                  'props': {
                    'panelKey': 'panel-3a',
                    'panelMeta': {
                      'filename': 'module/core/util.ts'
                    }
                  },
                  'componentName': 'lm-react-component',
                  'isClosable': true,
                  'reorderEnabled': true
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  'isClosable': true,
  'reorderEnabled': true,
  'title': '',
  'openPopouts': [],
  'maximisedItemId': null
};

const defaultDesktopConfig: GoldenLayoutConfig<CustomPanelMetaKey> = {
  settings: {
    hasHeaders: true,
    constrainDragToContainer: false,
    reorderEnabled: true,
    selectionEnabled: false,
    popoutWholeStack: false,
    blockedPopoutsThrowError: true,
    closePopoutsOnUnload: true,
    showPopoutIcon: false,
    showMaximiseIcon: true,
    showCloseIcon: true,
    responsiveMode: 'onload',
    tabOverlapAllowance: 0,
    reorderOnTabMenuClick: true,
    tabControlOffset: 10
  },
  dimensions: {
    borderWidth: 1,
    borderGrabWidth: 15,
    minItemHeight: 200,
    minItemWidth: 200,
    headerHeight: 20,
    dragProxyWidth: 200,
    dragProxyHeight: 100
  },
  labels: {
    close: 'close',
    maximise: 'maximise',
    minimise: 'minimise',
    popout: 'open in new window',
    popin: 'pop in',
    tabDropdown: 'additional tabs'
  },
  content: [
    {
      type: 'column',
      title: '',
      content: [
        {
          type: 'row',
          title: '',
          height: 100,
          content: [
            {
              type: 'stack',
              title: '',
              width: 50,
              activeItemIndex: 0,
              content: [
                {
                  type: 'component',
                  title: rootAppFilename,
                  component: 'window-panel',
                  props: {
                    panelKey: 'panel-1',
                    panelMeta: {
                      filename: rootAppFilename,
                    },
                  },
                  componentName: 'lm-react-component',
                },
                {
                  type: 'component',
                  title: 'reducer.ts',
                  component: 'window-panel',
                  props: {
                    panelKey: 'panel-2',
                    panelMeta: {
                      filename: 'reducer.ts',
                    },
                  },
                  componentName: 'lm-react-component',
                },
                {
                  type: 'component',
                  title: 'module/core/redux.model.ts',
                  component: 'window-panel',
                  props: {
                    panelKey: 'panel-2a',
                    panelMeta: {
                      filename: 'module/core/redux.model.ts',
                    },
                  },
                  componentName: 'lm-react-component',
                },
                {
                  type: 'component',
                  title: 'store/test.duck.ts',
                  component: 'window-panel',
                  props: {
                    panelKey: 'panel-2b',
                    panelMeta: {
                      filename: 'store/test.duck.ts',
                    },
                  },
                  componentName: 'lm-react-component',
                },
              ]
            },
            {
              type: 'column',
              title: '',
              width: 50,
              content: [
                {
                  type: 'stack',
                  header: {},
                  title: '',
                  activeItemIndex: 0,
                  width: 50,
                  height: 50,
                  content: [
                    {
                      type: 'component',
                      title: 'App',
                      component: 'window-panel',
                      props: {
                        panelKey: 'panel-3',
                        panelMeta: {
                          devEnvComponent: 'App',
                        }
                      },
                      componentName: 'lm-react-component',
                    },
                    {
                      type: 'component',
                      title: 'module/core/util.ts',
                      component: 'window-panel',
                      props: {
                        panelKey: 'panel-3a',
                        panelMeta: {
                          filename: 'module/core/util.ts'
                        }
                      },
                      componentName: 'lm-react-component',
                    },
                  ]
                },
                {
                  type: 'row',
                  title: '',
                  height: 50,
                  content: [
                    {
                      type: 'stack',
                      header: {},
                      title: '',
                      activeItemIndex: 0,
                      width: 50,
                      content: [
                        {
                          type: 'component',
                          title: 'index.scss',
                          component: 'window-panel',
                          props: {
                            panelKey: 'panel-4',
                            panelMeta: {
                              filename: 'index.scss',
                            },
                          },
                          componentName: 'lm-react-component',
                          isClosable: true,
                          reorderEnabled: true
                        }
                      ]
                    },
                    {
                      type: 'stack',
                      header: {},
                      title: '',
                      activeItemIndex: 0,
                      height: 50,
                      width: 50,
                      content: [
                        {
                          type: 'component',
                          title: 'other.scss',
                          component: 'window-panel',
                          props: {
                            panelKey: 'panel-5',
                            panelMeta: {
                              filename: 'other.scss',
                            },
                          },
                          componentName: 'lm-react-component',
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  title: '',
  openPopouts: [],
  maximisedItemId: null
};

/**
 * Default layout depends on screen width.
 */
export function getDefaultLayoutConfig() {
  return screenHasSmallWidth()
    ? deepClone(defaultMobileConfig)
    : deepClone(defaultDesktopConfig);
}

function screenHasSmallWidth() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
}

export function getConfigPanelKeys(config: GoldenLayoutConfig<CustomPanelMetaKey>) {
  const panelKeys = [] as string[];
  traverseGlConfig(config, (node) => {
    if ('type' in node && node.type === 'component' && node.props.panelKey) {
      panelKeys.push(node.props.panelKey);
    }
  });
  return panelKeys;
}
