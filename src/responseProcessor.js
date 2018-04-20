// @flow
export type ApiResponseType<Respond> = {
    data: Respond;
    status: number;
    source: Response;
}

type DecodedStream = Blob | Object | string;

export type ProcessedResponse = ApiResponseType<DecodedStream>;

/**
 * Decode API body response.
 *
 * @param {Response} response - Native response.
 * @returns {DecodedStream} Decoded json or simple string.
 */
function decodeResponse(response: Response): Promise<DecodedStream> {
    const contentType: ?string = response.headers.get('content-type');

    // on default decode response as text
    if (!contentType) {
        return response.text();
    }

    if (contentType.indexOf('json') >= 0) {
        return response.json();
    }

    if (contentType.indexOf('text') >= 0 || contentType.indexOf('xml') >= 0) {
        return response.text();
    }

    return response.blob();
}

/**
 * Process response from API.
 *
 * @param {Response} response - Native response.
 * @returns {Promise<ProcessedResponse>} Processed response from API.
 */
export default function responseProcessor(response: Response): Promise<ProcessedResponse> {
    return decodeResponse(response)
        .then((decodedResponse: DecodedStream) => {
            // create custom response format
            const toRespond: ProcessedResponse = {
                data: decodedResponse,
                status: response.status,
                source: response,
            };

            // response ok means that response was successful (2xx)
            if (response.ok) {
                return toRespond;
            }

            // otherwise create an error
            throw toRespond;
        });
}
