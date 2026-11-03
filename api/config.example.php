<?php
/** Copie para api/config.local.php e substitua os valores. Não compartilhe senhas. */
return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'NOME_DO_BANCO',
    'username' => 'USUARIO_DO_BANCO',
    'password' => 'SENHA_DO_BANCO',
    // Chave privada para criar o primeiro usuário em /admin/setup.php.
    'setup_key' => 'ALTERE_PARA_UMA_CHAVE_LONGA_ALEATORIA',
    // Chatbot: preferir variavel de ambiente OPENAI_API_KEY; alternativa em config.local.php.
    'openai_api_key' => '',
    'chatbot_model' => 'gpt-5.4-mini',
];
