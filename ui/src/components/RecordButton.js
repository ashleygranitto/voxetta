/**
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
import {Icon} from '@material/mwc-icon';
import {AudioRecorder} from '../utils/AudioRecorder';
import {UtteranceApiService} from '../utils/UtteranceApiService';
import {QualityControl} from '../utils/QualityControl';
import {dispatchErrorToast} from '../utils/ToastUtils.js';

import style from '../styles/components/RecordButton.css.js';

export class RecordButton extends LitElement {
    static get properties() {
        return {
            isRecording: {type: Boolean},
            audioStream: {type: Object},
            context: {type: Object},
        };
    }

    static get styles() {
        return style;
    }

    constructor() {
        super();
        this.isRecording = false;
        this.audioRecorder = new AudioRecorder();
        this.utteranceService = new UtteranceApiService();
    }

    updated() {
        this.handleWaveCanvas();
    }

    /**
     * If the user is not currently recording, begin recording using the Microphone
     * component. Otherwise, stop recording and save and display the just-recorded
     * audio file.
     */
    async recordHandler() {
        if (!this.isRecording) {
            try {
                await this.audioRecorder.initRecorder();
            } catch (e) {
                dispatchErrorToast(
                    this,
                    `Microphone access is currently blocked for this site. 
                    To unblock, please navigate to chrome://settings/content/microphone 
                    and remove this site from the 'Block' section.`
                );
                return;
            }

            if (!this.audioRecorder.startRecording()) {
                dispatchErrorToast(this, 'Failed to start recording.');
                return;
            }

            this.isRecording = true;
            this.audioStream = this.audioRecorder.stream;
            this.context = new (window.AudioContext ||
                window.webkitAudioContext)();
        } else {
            this.isRecording = false;
            let audio;

            try {
                audio = await this.audioRecorder.stopRecording();
            } catch (e) {
                dispatchErrorToast(
                    this,
                    `Could not record successfully; ${e.name}: ${e.message}`
                );
            }

            const qualityCheck = new QualityControl(this.context, audio.blob);
            const qualityResult = qualityCheck.isQualitySound();
            if (!qualityResult.success) {
                return;
            }

            if (audio.recordingUrl) {
                try {
                    const resp = await this.utteranceService.saveAudio(audio);

                    if (!resp) throw new Error();
                } catch (e) {
                    dispatchErrorToast(
                        this,
                        `Could not upload recording successfully`
                    );
                }
            }

            this.handleFinish();
        }
    }

    /**
     * Returns whether or not the application is actively recording.
     * @return {Boolean} Whether or not the application is actively
     *  recording.
     */
    getIsRecording() {
        return this.isRecording;
    }

    /**
     * Returns the current audio stream being recorded.
     * @returns {Object} The current audio stream being
     *  recorded.
     */
    getAudioStream() {
        return this.audioStream;
    }

    /**
     * Returns the context of the audio.
     * @returns {Object} The current context for the audio.
     */
    getContext() {
        return this.context;
    }

    /**
     * Emits an event that causes the application to render a sound
     * wave that corresponds to the current audio stream.
     */
    handleWaveCanvas() {
        const event = new CustomEvent('update-wave', {
            detail: {
                isRecording: this.isRecording,
                audioStream: this.audioStream,
                context: this.context,
            },

            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    /**
     * Emits an event that causes a new prompt to be rendered
     * on the recording page.
     */
    handleFinish() {
        const event = new CustomEvent('change-prompt', {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <mwc-icon-button
                id="record-button"
                icon=${this.isRecording ? 'stop' : 'mic'}
                class=${this.isRecording ? 'recording' : ''}
                @click=${this.recordHandler}
            >
            </mwc-icon-button>
        `;
    }
}

customElements.define('vox-record-button', RecordButton);
