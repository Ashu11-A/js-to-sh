# Classe Map implementada como uma estrutura baseada em funções
new_Map() {
    local self=$1
    eval "declare -gA ${self}_data"

    # Método para adicionar uma chave-valor ao Map
    eval "${self}_set() {
        local key=\"\$1\"
        local value=\"\$2\"
        ${self}_data[\"\$key\"]=\"\$value\"
    }"

    # Método para obter o valor associado a uma chave
    eval "${self}_get() {
        local key=\"\$1\"
        echo \"\${${self}_data[\"\$key\"]}\"
    }"

    # Método para verificar se uma chave existe no Map
    eval "${self}_has() {
        local key=\"\$1\"
        if [[ -v ${self}_data[\"\$key\"] ]]; then
            return 0
        else
            return 1
        fi
    }"

    # Método para deletar uma chave-valor do Map
    eval "${self}_delete() {
        local key=\"\$1\"
        unset ${self}_data[\"\$key\"]
    }"

    # Método para listar todas as chaves do Map
    eval "${self}_keys() {
        echo \"\${!${self}_data[@]}\"
    }"

    # Método para listar todos os valores do Map
    eval "${self}_values() {
        echo \"\${${self}_data[@]}\"
    }"

    # Método para obter o tamanho do Map
    eval "${self}_size() {
        echo \"\${#${self}_data[@]}\"
    }"

    # Método para limpar todos os pares chave-valor do Map
    eval "${self}_clear() {
        ${self}_data=()
    }"
}