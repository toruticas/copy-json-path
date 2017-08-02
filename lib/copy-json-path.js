'use babel';

import { CompositeDisposable } from 'atom';
import jsonPathTo from "./jsonPathTo";

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'copy-json-path:run': () => this.run()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  countCharacters(bufferText, position) {
    let lines = bufferText.split("\n")
    let count = 0

    for (var i = 0; i < position.row ; i++) {
      count += lines[i].length + 1
    }

    return count + position.column
  },

  run() {
    let editor, path, offset
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getText()

      try {
        JSON.parse(selection)
      } catch (e) {
        return atom.notifications.addWarning("copy-json-path: this action is enable only to a valid JSON file")
      }

      let offset = this.countCharacters(selection, editor.getCursorScreenPosition())

      try {
        path = jsonPathTo(selection, offset)
      } catch (e) {
        return atom.notifications.addWarning("copy-json-path: set cursor into a valid path key")
      }

      atom.clipboard.write(path)
      return atom.notifications.addSuccess(`copy-json-path: "${path}" copied to clipboard`)
    }
  }
};
