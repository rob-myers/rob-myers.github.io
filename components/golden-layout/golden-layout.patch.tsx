import * as $ from 'jquery';
import * as React from 'react';
import * as GoldenLayout from 'golden-layout';

/** Internal class we're going to patch */
const ReactComponentHandler = (GoldenLayout as any).__lm.utils.ReactComponentHandler;

export class ReactComponentHandlerPatched extends ReactComponentHandler {
  public static nextId = 0;
  /** Used in portal to prevent remounting. */
  public id: string;
  // Must not redeclare _container because it overwrites after `super`.

  constructor(...x: any[]) {
    super(...x);
    this.id = `id-${ReactComponentHandlerPatched.nextId++}`;
  }

  _render() {
    // Instance of GoldenLayoutComponent class
    const reactContainer = this._container.layoutManager.reactContainer;
    if (reactContainer && reactContainer.componentRender) {
      reactContainer.componentRender(this);
    }
  }

  _destroy() {
    const reactContainer = this._container.layoutManager.reactContainer;
    if (reactContainer && reactContainer.componentDestroy) {
      reactContainer.componentDestroy(this);
    }

    this._container.off('open', this._render, this);
    this._container.off('destroy', this._destroy, this);
  }

  _getReactComponent() {
    /**
     * The following method is a copy of the original,
     * provided to prevent dependency on window.React.
     */
    const defaultProps = {
      glEventHub: this._container.layoutManager.eventHub,
      glContainer: this._container,
    };
    const props = $.extend(defaultProps, this._container._config.props);
    return React.createElement(this._reactClass, props);
  }
}
