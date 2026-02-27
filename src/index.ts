import { Extension } from '@codemirror/state';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  EditorExtensionRegistry,
  IEditorExtensionRegistry
} from '@jupyterlab/codemirror';

import { EditorState, Compartment } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';

const languageConf = new Compartment();

// set to sql syntax if it starts with %%sql or %sql
// https://codemirror.net/examples/config/
const autoLanguage = EditorState.transactionExtender.of(tr => {
  const isSql = /^\s*%{1,2}sql/.test(tr.newDoc.sliceString(0, 100));
  return {
    effects: languageConf.reconfigure(isSql ? sql() : python())
  };
});

// Full extension composed of elemental extensions
export function chooseLang(): Extension {
  return [languageConf.of(python()), autoLanguage];
}

/**
 * Initialization data for the jupyterlabs-sql-codemirror extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@composable/jupyterlabs-sql-codemirror:plugin',
  description: 'A JupyterLab extension for sql syntax highlighting.',
  autoStart: true,
  requires: [IEditorExtensionRegistry],
  activate: (app: JupyterFrontEnd, extensions: IEditorExtensionRegistry) => {
    // Register a new editor configurable extension
    extensions.addExtension(
      Object.freeze({
        name: 'custom-sql-style',
        factory: () =>
          // The factory will be called for every new CodeMirror editor
          EditorExtensionRegistry.createConfigurableExtension(() =>
            chooseLang()
          )
      })
    );
  }
};

export default plugin;