/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from 'lit-element';

import * as promptApi from '../utils/PromptApiService.js';

// import {Icon} from '@material/mwc-icon';

import style from '../styles/VoxettaPrompts.css.js';

export class VoxettaPrompts extends LitElement {
    static get properties() {
        return {
            prompt: {type: Object},
            state: {type: String},
        };
    }

    static get styles() {
        return style;
    }

    constructor() {
        super();
        this.state = 'NOT_ASKED';
    }

    firstUpdated() {
        this.getNewPrompt();
    }

    /**
     * Emits an event that causes audio-recording related components
     * to disappear.
     */
    // TODO: figure out why this throws and unexpected token error
    async getNewPrompt() {
        this.state = 'LOADING';
        const promptRequest = await promptApi.getNewPrompt();

        if (promptRequest.status === 'SUCCESS') {
            this.state = 'SUCCESS';
            this.prompt = promptRequest.prompt;
        } else if (promptRequest.status === 'EMPTY') {
            this.handleSessionEnd();
            this.state = 'FINISHED';
        } else {
            this.state = 'FAILURE';
        }
    }

    /**
     * Determines the approriate method of rendering the current prompt.
     * @return {HTML} The HTML associated with the current prompt.
     */
    renderPromptType() {
        switch (this.prompt.type) {
            case 'TEXT':
                return html`<p>${this.prompt.body}</p>`;
            case 'IMAGE':
                return html`<img
                    src="${this.prompt.body}"
                    alt="Prompt Image"
                />`;
        }
    }

    /**
     * Determines the appropriate rendering action based on the current
     * prompt state.
     * @return {HTML} The HTML associated with the current state.
     */
    renderPromptState() {
        switch (this.state) {
            case 'SUCCESS':
                return this.renderPromptType();
            case 'LOADING':
                return html`<p>Loading............</p>`;
            case 'FAILURE':
                return html`<p><b>Prompt failed to load.</b></p>`;
            case 'FINISHED':
                return html`<p>Your work session is finished.</p>`;
        }
    }

    handleResetPrompts() {
        promptApi.resetAllPromptsUnread();
    }

    /**
     * Emits an event that causes audio-recording related components
     * to disappear.
     */
    handleSessionEnd() {
        const event = new CustomEvent('end-session', {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    // TODO: cleanup reset button methodology
    render() {
        return html`
            <div id="prompt-screen">
                ${this.renderPromptState()}
            </div>
            <button @click="${this.handleResetPrompts}">
                reset all prompts to unread
            </button>
        `;
    }
}

customElements.define('vox-prompts', VoxettaPrompts);
