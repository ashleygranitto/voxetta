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

import {LitElement, html, css} from 'lit-element';

import {TextField} from '@material/mwc-textfield';
import {Select} from '@material/mwc-select';
import {ListItem} from '@material/mwc-list/mwc-list-item';
import {Button} from '@material/mwc-button';
import {Icon} from '@material/mwc-icon';

import style from '../styles/components/UserForm.css.js';

const MAX_USER_AGE = 120;
const MIN_USER_AGE = 0;

/**
 * Component responsible for providing users a means to provide
 * their personal information.
 */
export class UserForm extends LitElement {
    static get properties() {
        return {
            deviceType: {type: String},
            disableSaveButton: {type: String},
            gender: {type: String},
            loginCompleted: {type: Boolean},
            userAge: {type: Number},
            userId: {type: String},
        };
    }

    static get styles() {
        return style;
    }

    constructor() {
        super();
        this.disableSaveButton = true;
        this.addEventListener('input', this.formIsValid);
    }

    firstUpdated() {
        if (!this.loginCompleted) {
            this.checkInitialEnable();
        }
        this.handleFirstAccess();
    }

    /**
     * Checks to see if the user submitted valid information, and if so,
     * saves the user information in a cookie.
     */
    processForm() {
        this.userId = this.shadowRoot.getElementById('user-id').value;
        this.gender = this.shadowRoot.getElementById('gender-list').value;
        this.userAge = this.shadowRoot.getElementById('user-age').value;
        this.deviceType = this.shadowRoot.getElementById('device-type').value;

        const userInfo = {
            userId: this.userId,
            gender: this.gender,
            userAge: this.userAge,
            deviceType: this.deviceType,
        };

        this.handleFormSubmission(userInfo);
        this.handleExitForm();
    }

    /**
     * Determines if each input in the user form is valid and alters Save Button appropriately.
     */
    formIsValid() {
        const userIdValidity = this.shadowRoot
            .getElementById('user-id')
            .checkValidity();
        const genderValidity = this.shadowRoot
            .getElementById('gender-list')
            .checkValidity();
        const userAgeValidity = this.shadowRoot
            .getElementById('user-age')
            .checkValidity();
        const deviceTypeValidity = this.shadowRoot
            .getElementById('device-type')
            .checkValidity();

        const formValidity =
            userIdValidity &&
            genderValidity &&
            userAgeValidity &&
            deviceTypeValidity;

        this.disableSaveButton = !formValidity;
    }

    /**
     * Enables the save button when accessed via the login flow if
     * the cookies and URL contain every required piece of user information.
     */
    checkInitialEnable() {
        let formValidity = true;
        const filledOut =
            this.userId && this.gender && this.userAge && this.deviceType;

        if (!filledOut) {
            formValidity = false;
        }

        if (this.userAge < MIN_USER_AGE || this.userAge > MAX_USER_AGE) {
            formValidity = false;
        }

        this.disableSaveButton = !formValidity;
    }

    /**
     * Emits an event that causes the loggingIn property to be made
     * false.
     */
    handleFirstAccess() {
        const event = new CustomEvent('first-access-over', {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    /**
     * Emits an event that causes the form page to close and the record
     * page to appear.
     */
    handleExitForm() {
        const event = new CustomEvent('exit-form', {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    /**
     * Emits an event that causes the user infomration to update.
     * @param {Object} userInfo - The information entered on the user form.
     */
    handleFormSubmission(userInfo) {
        const event = new CustomEvent('update-user-info', {
            detail: {userInfo},
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <section class="container">
                <div class="header-container">
                    <div class="icon-container">
                        <mwc-icon>account_circle</mwc-icon>
                    </div>
                    <div class="title-container">
                        <h1 class="title">User information</h1>
                    </div>
                </div>
                <h2 class="description">
                    Your recording will be tagged with the following:
                </h2>
                <form id="user-form" class="container">
                    <mwc-textfield
                        id="user-id"
                        outlined
                        required
                        validationMessage="This field is required."
                        label="User identifier"
                        value=${this.userId}
                    >
                    </mwc-textfield>
                    <div class="mwc-select">
                        <mwc-select
                            id="gender-list"
                            outlined
                            required
                            validationMessage="This field is required."
                            label="Gender"
                            placeholder="Select your gender"
                            value=${this.gender}
                            @click=${this.formIsValid}
                        >
                            <mwc-list-item disabled></mwc-list-item>
                            <mwc-list-item value="Female">Female</mwc-list-item>
                            <mwc-list-item value="Male">Male</mwc-list-item>
                            <mwc-list-item value="Other">Other</mwc-list-item>
                        </mwc-select>
                    </div>
                    <mwc-textfield
                        id="user-age"
                        type="number"
                        outlined
                        required
                        validationMessage="This field is required."
                        label="Age"
                        placeholder="Enter your age"
                        min="0"
                        max="120"
                        value=${this.userAge}
                    >
                    </mwc-textfield>
                    <mwc-textfield
                        id="device-type"
                        outlined
                        required
                        validationMessage="This field is required."
                        label="Device"
                        placeholder="Device type"
                        value=${this.deviceType}
                    >
                    </mwc-textfield>
                    <mwc-button
                        id="save-button"
                        class="save"
                        unelevated
                        ?disabled=${this.disableSaveButton}
                        label="Save"
                        @click=${this.processForm}
                    >
                    </mwc-button>
                </form>

                <!-- 'Cancel' button is not visible before a complete login -->
                ${this.loginCompleted
                    ? html`
                          <mwc-button
                              class="cancel"
                              unelevated
                              label="Cancel"
                              @click=${this.handleExitForm}
                          >
                          </mwc-button>
                      `
                    : html``}
            </section>
        `;
    }
}

customElements.define('vox-user-form', UserForm);
