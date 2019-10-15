pragma solidity ^0.4.17;

contract VendaEnergia {
    address public concessor;
    uint public precoWh;
    uint energiaComprada;
    uint energiaConsumida;
    uint energiaDisponivel;
    bool balancoPositivo;


    function VendaEnergia(uint precoWHInicial) public { //funcao construtora  // preco em wei
        require(precoWHInicial > 0);  // preco em nanoether // preco no estado de sp = 630 gwei (nano ether)
        concessor = msg.sender;
        precoWh = precoWHInicial*(10**9);
        balancoPositivo = false;
    }

    function comprarEnergia() public payable {
        require(msg.value > .01 ether);  // aproximadamente 8 reais
        energiaComprada = energiaComprada + (msg.value/precoWh);
        energiaDisponivel = energiaComprada - energiaConsumida;
        if (energiaComprada - energiaConsumida > 0){
            balancoPositivo = true;
        }else {
            energiaDisponivel =0;
        }
    }

    function logarConsumo(uint novoConsumo) public restricted {
        require(novoConsumo > energiaConsumida);
        energiaConsumida = novoConsumo;
        energiaDisponivel = energiaComprada - energiaConsumida;
        if (energiaComprada <= energiaConsumida){
            balancoPositivo = false;
            energiaDisponivel = 0;
        }
    }

    function mudarPrecoWh(uint novoPreco) public restricted { //preco em gwei
        require(novoPreco > 0);
        precoWh = novoPreco*(10**9);
    }

    function receberDinheiro() public restricted { //preco em gwei
        concessor.transfer(this.balance);  // manda o dinheiro no contrato para o concessor.
    }

    function getEnergiaConsumida() public view returns (uint) {
        return energiaConsumida;
    }
    function getEnergiaComprada() public view returns (uint) {
        return energiaComprada;
    }
    function getEnergiaDisponivel() public view returns (uint) {
        return energiaDisponivel;
    }

    function getBalanco() public view returns (bool){
        return balancoPositivo;
    }

    modifier restricted() {
        require(msg.sender == concessor);
        _;
    }



}
