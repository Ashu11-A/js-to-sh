function custom_curl() {
    local url="$1"
    local method="$2"
    local headers="$3"
    local body="$4"
    local redirect="$5"
    local referrer="$6"
    local credentials="$7"
    
    local curl_cmd="curl -s -o response.txt -w \"%{http_code}\""

    # Método HTTP
    if [ -n "$method" ]; then
        curl_cmd+=" -X $method"
    fi

    # Headers
    if [ -n "$headers" ]; then
        IFS=";" read -ra header_array <<< "$headers"
        for header in "${header_array[@]}"; do
            curl_cmd+=" -H \"$header\""
        done
    fi

    # Corpo da requisição
    if [ -n "$body" ]; then
        curl_cmd+=" -d '$body'"
    fi

    # Redirecionamento
    if [ "$redirect" == "follow" ]; then
        curl_cmd+=" -L"
    fi

    # Referrer
    if [ -n "$referrer" ]; then
        curl_cmd+=" -e $referrer"
    fi

    # # Credentials
    # if [ "$credentials" == "include" ]; then
    #     curl_cmd+=" -b \"cookie_data\"" # Adapte conforme necessário
    # fi

    # URL
    curl_cmd+=" $url"

    # Executa ou imprime o comando curl gerado
    status_code=$(eval $curl_cmd)
}

function custom_wget() {
    local url="$1"
    local method="$2"
    local headers="$3"
    local body="$4"
    local redirect="$5"
    local referrer="$6"
    local credentials="$7"
    
    local wget_cmd="wget -qO-"

    # URL
    wget_cmd+=" $url"

    # Método HTTP
    if [ "$method" == "POST" ]; then
        wget_cmd+=" --post-data=\"$body\""
    elif [ "$method" == "PUT" ]; then
        wget_cmd+=" --method=PUT --body-data=\"$body\""
    elif [ "$method" == "DELETE" ]; then
        wget_cmd+=" --method=DELETE"
    fi

    # Headers
    if [ -n "$headers" ]; then
        IFS=";" read -ra header_array <<< "$headers"
        for header in "${header_array[@]}"; do
            wget_cmd+=" --header=\"$header\""
        done
    fi

    # Redirecionamento
    if [ "$redirect" == "follow" ]; then
        wget_cmd+=" --max-redirect=20"
    fi

    # Referrer
    if [ -n "$referrer" ]; then
        wget_cmd+=" --referer=$referrer"
    fi

    # # Credentials (cookies)
    # if [ "$credentials" == "include" ]; then
    #     wget_cmd+=" --load-cookies=cookies.txt" # Adapte conforme necessário
    # fi

    # Captura o corpo da resposta
    echo $wget_cmd
    response=$(eval $wget_cmd)
    echo "$response" > response.txt

    # Captura o código de status HTTP
    status_code=$(wget -S --spider "$url" 2>&1 | grep "HTTP/" | awk '{print $2}')
}

# Função para retornar o corpo da resposta
function fetchBody() {
    cat response.txt
}

# Função para retornar os cabeçalhos (somente se estiver usando `curl -D-`)
function fetchHeaders() {
    curl -s -D- -o /dev/null "$1"
}

# Função para retornar o JSON da resposta (se aplicável)
function fetchJson() {
    cat response.txt | jq '.'
}

# Função para verificar se a resposta foi bem-sucedida
function fetchOk() {
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Função para retornar o código de status
function fetchStatus() {
    echo "$status_code"
}

function fetchShell() {
    local url="$1"
    local method="$2"
    local headers="$3"
    local body="$4"
    local redirect="$5"
    local referrer="$6"
    local credentials="$7"

    if isCommand 'curl'; then
        custom_curl "$url" "$method" "$headers" "$body" "$redirect" "$referrer" "$credentials"
    elif isCommand 'wget'; then
        custom_wget "$url" "$method" "$headers" "$body" "$redirect" "$referrer" "$credentials"
    else
        echo "curl or wget is not installed on the system"
        exit 1
    fi
}