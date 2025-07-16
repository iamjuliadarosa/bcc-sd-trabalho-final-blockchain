// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EleicaoRegistry {
    struct Registro {
        uint256 timestamp;
        string hashResultado;
    }

        mapping(uint => mapping(string => uint)) public votosPorOpcao;

        function votar(uint eleicaoId, string memory opcao) public {
            votosPorOpcao[eleicaoId][opcao]++;
        }

        function consultarResultado(uint eleicaoId, string[] memory opcoes) public view returns (uint[] memory) {
            uint[] memory resultados = new uint[](opcoes.length);
            for (uint i = 0; i < opcoes.length; i++) {
                resultados[i] = votosPorOpcao[eleicaoId][opcoes[i]];
            }
            return resultados;
        }
}