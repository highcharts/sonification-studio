/* *
 *
 *  (c) 2009-2020 Øystein Moseng
 *
 *  Generic accessible popup dialog.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
/* eslint-disable no-invalid-this, valid-jsdoc */
import H from '../../parts/Globals.js';
var doc = H.doc;
var userAgent = H.win.navigator.userAgent;
// TODO: Styling options, lang options, styled mode
/**
 * @private
 */
var PopupDialog = /** @class */ (function () {
    function PopupDialog(parentDiv, content) {
        var _this = this;
        this.parentDiv = parentDiv;
        this.useFlex = !(/msie/i.test(userAgent)); // Don't use flexbox on IE
        var dc = this.dialogContainer = doc.createElement('div');
        dc.className = 'highcharts-popup-dialog';
        var flexContainer = this.flexContainer = doc.createElement('div');
        var dialogBox = this.dialogBox = doc.createElement('div');
        dialogBox.setAttribute('role', 'dialog');
        dialogBox.setAttribute('aria-label', 'Dialog');
        var innerContainer = this.innerContainer = doc.createElement('div');
        var contentContainer = this.contentContainer = doc.createElement('div');
        contentContainer.className = 'highcharts-popup-content-container';
        var closeButton = this.closeButton = doc.createElement('button');
        closeButton.setAttribute('aria-label', 'Close dialog');
        closeButton.innerHTML = this.getCloseButtonContent();
        closeButton.className = 'highcharts-popup-close-button';
        closeButton.onclick = function () { return _this.hide(); };
        this.addDialogStyle();
        if (content) {
            this.setContent(content);
        }
        innerContainer.appendChild(closeButton);
        innerContainer.appendChild(contentContainer);
        dialogBox.appendChild(innerContainer);
        flexContainer.appendChild(dialogBox);
        dc.appendChild(flexContainer);
        parentDiv.insertBefore(dc, parentDiv.firstChild);
    }
    PopupDialog.prototype.setContent = function (content) {
        this.contentContainer.innerHTML = content;
        this.updateDialogPosition();
    };
    PopupDialog.prototype.show = function () {
        this.dialogContainer.style.display = 'block';
    };
    PopupDialog.prototype.hide = function () {
        this.dialogContainer.style.display = 'none';
    };
    PopupDialog.prototype.destroy = function () {
        this.dialogContainer.remove();
    };
    PopupDialog.prototype.updateDialogPosition = function () {
        // In order to get dimensions we need to show the dialog.
        // This will not be visible to the end user, as the browser
        // will not repaint while JS is running synchronously.
        this.show();
        var parentHeight = this.parentDiv.clientHeight + 'px';
        this.hide();
        this.flexContainer.style.height = parentHeight;
        if (!this.useFlex) {
            this.flexContainer.style.lineHeight = parentHeight;
        }
    };
    PopupDialog.prototype.addDialogStyle = function () {
        var setElementStyle = function (el, styles) {
            el.style.cssText = styles.join(';');
        };
        setElementStyle(this.dialogContainer, [
            'display: none',
            'position: relative',
            'z-index: 9999'
        ]);
        setElementStyle(this.flexContainer, [
            'position: absolute',
            'left: 0',
            'right: 0'
        ].concat(this.useFlex ? [
            'display: flex',
            'justify-content: center',
            'align-items: center'
        ] : [
            'text-align: center',
            'vertical-align: middle'
        ]));
        setElementStyle(this.dialogBox, [
            'background-color: #fff',
            'box-shadow: 0 0 10px rgba(0, 0, 0, 0.5)'
        ].concat(this.useFlex ? [] : [
            'display: inline-block',
            'line-height: initial'
        ]));
        setElementStyle(this.innerContainer, [
            'position: relative',
            'padding: 10px'
        ]);
        setElementStyle(this.closeButton, [
            'position: absolute',
            'right: 5px',
            'top: 5px',
            'background: none',
            'border: none',
            'padding: 0',
            'cursor: pointer'
        ]);
    };
    PopupDialog.prototype.getCloseButtonContent = function () {
        return '<svg width="20" height="20" viewBox="0 0 120 120">' +
            '<path stroke="#4B4B4D" stroke-width="9" stroke-linecap="round"' +
            'd="M14,14 L106,106 M106,14 L14,106"/></svg>';
    };
    return PopupDialog;
}());
export default PopupDialog;
