# Classe Set implementada como uma estrutura baseada em funções
new_Set() {
    local self=$1

    # Inicializar o conjunto como um array associativo
    eval "declare -gA ${self}_data"

    # Adicionar um valor ao Set
    eval "${self}_add() {
        local value=\"\$1\"
        ${self}_data[\"\$value\"]=1
    }"

    # Verificar se o valor existe no Set
    eval "${self}_has() {
        local value=\"\$1\"
        if [[ -v ${self}_data[\"\$value\"] ]]; then
            return 0
        else
            return 1
        fi
    }"

    # Remover um valor do Set
    eval "${self}_delete() {
        local value=\"\$1\"
        if [[ -v ${self}_data[\"\$value\"] ]]; then
            unset ${self}_data[\"\$value\"]
            return 0
        else
            return 1
        fi
    }"

    # Listar todos os valores no Set
    eval "${self}_values() {
        echo \"\${!${self}_data[@]}\"
    }"

    # Listar todas as entradas como pares [v, v]
    eval "${self}_entries() {
        for key in \"\${!${self}_data[@]}\"; do
            echo \"[\$key, \$key]\"
        done
    }"

    # Listar todas as chaves no Set (igual ao values)
    eval "${self}_keys() {
        echo \"\${!${self}_data[@]}\"
    }"

    # Obter o tamanho do Set
    eval "${self}_size() {
        echo \"\${#${self}_data[@]}\"
    }"

    # Limpar todos os valores no Set
    eval "${self}_clear() {
        for key in \"\${!${self}_data[@]}\"; do
            unset ${self}_data[\"\$key\"]
        done
    }"

    # Iterar sobre cada elemento do Set
    eval "${self}_forEach() {
        local callback=\"\$1\"
        for key in \"\${!${self}_data[@]}\"; do
            \$callback \"\$key\" \"\$key\" \"${self}\"
        done
    }"

    # União de dois conjuntos
    eval "${self}_union() {
        local other=\"\$1\"
        local newSet=\"\$2\"
        Set \"\$newSet\"
        for key in \"\${!${self}_data[@]}\"; do
            \${newSet}_add \"\$key\"
        done
        for key in \"\${!${other}_data[@]}\"; do
            \${newSet}_add \"\$key\"
        done
    }"

    # Interseção de dois conjuntos
    eval "${self}_intersection() {
        local other=\"\$1\"
        local newSet=\"\$2\"
        Set \"\$newSet\"
        for key in \"\${!${self}_data[@]}\"; do
            if [[ -v ${other}_data[\"\$key\"] ]]; then
                \${newSet}_add \"\$key\"
            fi
        done
    }"

    # Diferença de dois conjuntos
    eval "${self}_difference() {
        local other=\"\$1\"
        local newSet=\"\$2\"
        Set \"\$newSet\"
        for key in \"\${!${self}_data[@]}\"; do
            if [[ ! -v ${other}_data[\"\$key\"] ]]; then
                \${newSet}_add \"\$key\"
            fi
        done
    }"

    # Diferença simétrica entre dois conjuntos
    eval "${self}_symmetricDifference() {
        local other=\"\$1\"
        local newSet=\"\$2\"
        Set \"\$newSet\"
        for key in \"\${!${self}_data[@]}\"; do
            if [[ ! -v ${other}_data[\"\$key\"] ]]; then
                \${newSet}_add \"\$key\"
            fi
        done
        for key in \"\${!${other}_data[@]}\"; do
            if [[ ! -v ${self}_data[\"\$key\"] ]]; then
                \${newSet}_add \"\$key\"
            fi
        done
    }"

    # Subconjunto
    eval "${self}_isSubsetOf() {
        local other=\"\$1\"
        for key in \"\${!${self}_data[@]}\"; do
            if [[ ! -v ${other}_data[\"\$key\"] ]]; then
                return 1
            fi
        done
        return 0
    }"

    # Superconjunto
    eval "${self}_isSupersetOf() {
        local other=\"\$1\"
        for key in \"\${!${other}_data[@]}\"; do
            if [[ ! -v ${self}_data[\"\$key\"] ]]; then
                return 1
            fi
        done
        return 0
    }"

    # Disjunto
    eval "${self}_isDisjointFrom() {
        local other=\"\$1\"
        for key in \"\${!${self}_data[@]}\"; do
            if [[ -v ${other}_data[\"\$key\"] ]]; then
                return 1
            fi
        done
        return 0
    }"
}