import * as React from 'react';
import * as ReactDOM from 'react-dom';
import GoldenLayout from 'golden-layout';
import * as shortId from 'shortid';
import { deepClone, assign } from '@model/generic.model';
import { GoldenLayoutConfig, GoldenLayoutConfigItem, ReactComponentConfig, ExtendedContainer } from '@model/layout/layout.model';
import { ReactComponentHandlerPatched } from './golden-layout.patch';

import './golden-layout.scss';

// Apply patch
(GoldenLayout as any)['__lm'].utils.ReactComponentHandler = ReactComponentHandlerPatched;

export default class GoldenLayoutComponent extends React.Component<Props, State> {
  public state: State = { renderPanels: new Set() };
  public goldenLayoutInstance!: GoldenLayout;
  private containerRef = React.createRef<HTMLDivElement>();

  public render() {
    const panels = Array.from(this.state.renderPanels);
    const panelCmps = panels.map((panel) => {
      return ReactDOM.createPortal(
        panel._getReactComponent(),
        panel._container.getElement()[0],
        // Panels must have respective keys.
        // Otherwise on destroy window-pane, each window-pane on right is remounted (?)
        panel.id,
      );
    });

    return (
      <div ref={this.containerRef}
        {...this.props.htmlAttrs}>
        {panelCmps}
      </div>
    );
  }

  /** Invoked by golden-layout */
  public componentRender(reactComponentHandler: ReactComponentHandlerPatched) {
    this.setState((state) => {
      const renderPanels = new Set(state.renderPanels);
      renderPanels.add(reactComponentHandler);
      return { renderPanels };
    });
  }

  /** Invoked by golden-layout */
  public componentDestroy(reactComponentHandler: ReactComponentHandlerPatched) {
    this.setState((state) => {
      const newRenderPanels = new Set(state.renderPanels);
      newRenderPanels.delete(reactComponentHandler);
      return { renderPanels: newRenderPanels };
    });
    window.removeEventListener('resize', () => this.goldenLayoutInstance.updateSize());
  }

  public componentDidMount() {
    this.goldenLayoutInstance = new GoldenLayout(
      this.props.initConfig,
      this.containerRef.current || undefined,
    );

    // Resize with window
    window.addEventListener('resize', () =>
      this.goldenLayoutInstance.updateSize()
    );

    // Add duplication button on tab creation.
    this.goldenLayoutInstance.on('tabCreated', (tab: GoldenLayout.Tab & {
      contentItem: ExtendedContainer;
    }) => {
      // console.log({ tab }, tab.contentItem);

      // Listen for commencement of tab dragging.
      (tab as any)['_dragListener'].on('dragStart', () => {
        // console.log('dragStart', tab.contentItem);
        this.props.onDragStart(tab.contentItem);
      });

      // Add 'duplication' button to stack header if haven't already.
      const { controlsContainer } = tab.header;
      if (controlsContainer.find('.lm_popout').length === 0) {
        const buttonEl = this.createDuplicationButton();
        controlsContainer.prepend(buttonEl);

        // We want to duplicate the tab's component
        // when the user drags the 'duplication' button.
        const config =  tab.contentItem.config as GoldenLayoutConfigItem<any>;
        this.createDragSource(buttonEl, config);

        // Show/hide 'duplication' button on maximise/minimise.
        controlsContainer
          .find('.lm_maximise')
          .click(() => buttonEl.hidden = !buttonEl.hidden);

        // Refresh config inside dragSource after use,
        // thereby avoiding duplicate panelKey's.
        buttonEl.addEventListener('mousedown', () => {
          const onDropDuplicate = () => {
            // console.log('DROPPED ELEMENT');
            this.removeDragSource(buttonEl);
            this.createDragSource(buttonEl, config);
            this.goldenLayoutInstance.off('stackCreated', onDropDuplicate);
          };
          this.goldenLayoutInstance.on('stackCreated', onDropDuplicate);
        });
        // buttonEl.addEventListener('click', () =>
        //   console.log(this.goldenLayoutInstance.toConfig()));
      }
    });

    // Detect when GoldenLayout has initialized.
    let initialized = false;
    const onInitialized = () => {
      initialized = true;
      this.goldenLayoutInstance.off('initialised', onInitialized);
    };
    this.goldenLayoutInstance.on('initialised', onInitialized);

    // Detect changes to all stacks created.
    // However, we only act post-initialization.
    this.goldenLayoutInstance.on('stackCreated', (stack: GoldenLayout.ContentItem) => {
      // Detect if selected child has changed.
      stack.on('activeContentItemChanged', (child: ExtendedContainer) => {
        if (initialized) {
          if (child.parent.contentItems.length === 1) {
            return; // Ignore degenerate case where no siblings.
          }
          // Find duplication button.
          const { controlsContainer } = child.tab.header;
          const [buttonEl] = controlsContainer.find('.lm_popout');
          if (!buttonEl) {
            return console.error('Expected \'.lm_popout\' inside stack\'s controlsContainer.');
          }
          // Replace previous dragSource.
          this.removeDragSource(buttonEl);
          this.createDragSource(buttonEl, child.config);
        }
      });
    });

    this.goldenLayoutInstance.on('componentCreated',
      (cmp: ExtendedContainer) => this.props.onComponentCreated(cmp));
    
    // Register React components.
    if (this.props.registerComponents instanceof Function) {
      this.props.registerComponents(this.goldenLayoutInstance);
    }
    (this.goldenLayoutInstance as any)['reactContainer'] = this;

    // Finally, render the layout.
    this.goldenLayoutInstance.init();
  }

  private removeDragSource(dragSourceEl: HTMLElement) {
    const dragSources = (this.goldenLayoutInstance as any)['_dragSources'] as {
      _dragListener: { destroy: () => void };
      _element: JQuery<HTMLElement>;
    }[];
    const dragSource = dragSources.find(({ _element: [el] }) => el === dragSourceEl);

    if (!dragSource) {
      console.error('Expected dragSource for HTMLElement:');
      console.log(dragSourceEl);
      return;
    }
    // Remove dragSource.
    dragSource._dragListener.destroy();
    dragSources.splice(dragSources.indexOf(dragSource), 1);
  }

  /**
   * Attach a "drag detector" (drag source) to specific button element.
   * We specify the newPanelKey which'll only be instantiated if the user drags and drops.
   * 
   * Create new dragSource using `config` as template, but:
   * 1. Use new distinct `panelKey`.
   * 2. Change 'component' back to 'react-component'.
   */
  private createDragSource(buttonEl: HTMLElement, config: GoldenLayoutConfigItem<any>) {
    // 'react-component' becomes 'component' internally.
    if (config.type === 'component') {
      // origPanelKey needn't be defined in original config, but will from now on.
      const origPanelKey = config.origPanelKey || config.props.panelKey;
      const newPanelKey = `${origPanelKey}-${shortId.generate()}`;

      const dupConfig: ReactComponentConfig<any> = assign(
        deepClone(config),
        {
          type: 'react-component',
          origPanelKey,
          props: { ...config.props, panelKey: newPanelKey },
        } as ReactComponentConfig<any>,
      );
      this.goldenLayoutInstance.createDragSource(buttonEl, dupConfig);
    }
  }
  
  private createDuplicationButton(): HTMLLIElement {
    const li = document.createElement('li');
    li.title = 'drag to duplicate';
    li.className = 'lm_popout';
    return li;
  }
}

interface Props {
  htmlAttrs: React.HTMLAttributes<any>; 
  /**
   * Initial layout config, subsequent changes ignored.
   * In accordance with 'golden-layout' API.
   */
  initConfig: GoldenLayoutConfig<any>;
  /** Registration of React components. */
  registerComponents: (layout: GoldenLayout) => void;
  /** https://golden-layout.com/docs/GoldenLayout.html#Events  */
  onComponentCreated: (component: ExtendedContainer) => void;
  /** Invoked on commence dragging of a tab. */
  onDragStart: (component: ExtendedContainer) => void;
}

interface State {
  renderPanels: Set<ReactComponentHandlerPatched>;
}
