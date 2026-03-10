#include <stdio.h>
#include <stdlib.h>
#include <curl/curl.h>

// Callback to write response data into a string buffer
size_t write_callback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t total_size = size * nmemb;
    strncat((char *)userp, (char *)contents, total_size);
    return total_size;
}

int main(void) {
    CURL *curl;
    CURLcode res;

    // Buffer to hold the response (make sure it's large enough)
    char response[100000] = {0};

    // Open-Meteo API URL for 1-day forecast
    const char *url = "https://api.open-meteo.com/v1/forecast"
                      "?latitude=10.3541&longitude=123.9165"
                      "&forecast_days=1&hourly=temperature_2m,wind_speed_10m";

    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, response);

        // Perform the request
        res = curl_easy_perform(curl);

        if(res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n",
                    curl_easy_strerror(res));
        } else {
            // Print raw JSON response
            printf("API Response:\n%s\n", response);
        }

        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();
    return 0;
}
