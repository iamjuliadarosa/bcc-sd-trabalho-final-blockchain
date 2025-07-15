// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EleicaoRegistry {
    struct Registro {
        uint256 timestamp;
        string hashResultado;
    }

    mapping(uint256 => Registro) public registros;

    event RegistroCriado(uint256 eleicaoId, string hashResultado, uint256 timestamp);

    // Registrar hash do resultado para uma eleição
    function registrarResultado(uint256 eleicaoId, string memory hashResultado) public {
        registros[eleicaoId] = Registro(block.timestamp, hashResultado);
        emit RegistroCriado(eleicaoId, hashResultado, block.timestamp);
    }

    // Consultar registro pelo ID da eleição
    function consultarRegistro(uint256 eleicaoId) public view returns (string memory, uint256) {
        Registro memory r = registros[eleicaoId];
        return (r.hashResultado, r.timestamp);
    }
}