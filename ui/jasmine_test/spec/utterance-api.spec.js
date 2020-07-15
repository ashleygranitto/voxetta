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

import {UtteranceApiService} from '../../src/utils/UtteranceApiService';
import fetchMock from 'fetch-mock';

describe('Testing that the Utterance API Service', () => {
    
    const utteranceService = new UtteranceApiService(); 

    afterEach(() => {
        fetchMock.reset();
    });

    it('returns a url upon success', async () => {
        const dummyUrlResponse = {
            success: true,
            url: "blobstore.com"
        };

        // Mock successful fetch
        fetchMock.mock('/blobstore-utterance-upload-link', {
            status: 200,
            body: dummyUrlResponse
        });

        const response = await utteranceService.getUploadUrl();
        expect(response).toEqual("blobstore.com");
    });

    it('returns null upon failure', async () => {
        const dummyErrorResponse = {
            success: false,
            message: "Error: Failed to upload Utterance to Datastore."
        };

        // Mock unsuccessful fetch
        fetchMock.mock('/blobstore-utterance-upload-link', {
            status: 200,
            body: dummyErrorResponse
        });
        
        const response = await utteranceService.getUploadUrl();
        expect(response).toBeNull();
    }); 
});