const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let vendaEnergia; // variavel para aramazenar instancia do contrato
let accounts; // variavel para aramazenar contas geradas pelo ganache para testes

beforeEach(async () => {
  accounts = await web3.eth.getAccounts(); // passa as contas criadas pelo ganache para a variavel accounts

  vendaEnergia = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ["630"] })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Contrato de venda de energia", () => {
  it("Realiza deploy do contrato", () => {
    assert.ok(vendaEnergia.options.address);
  });

  it("Permite comprar energia", async () => {
    await vendaEnergia.methods.comprarEnergia().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether")
    });
  });

  it("Permite comprar energia de qualquer contas", async () => {
    await vendaEnergia.methods.comprarEnergia().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether")
    });
  });

  it("Nao permite fazer uma compra com valor inferior a 10 finneys", async () => {
    try {
      await vendaEnergia.methods.comprarEnergia().send({
        from: accounts[2],
        value: web3.utils.toWei("0.0099", "ether")
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Permite qualquer um verificar o preco do WH", async () => {
    await vendaEnergia.methods.precoWh().send({
      from: accounts[2]
    });
  });

  it("Permite o concessor mudar o preco do WH", async () => {
    await vendaEnergia.methods.mudarPrecoWh("640").send({
      from: accounts[0]
    });
  });

  it("Exige que um valor seja passado quando solicitar a mudanca do preco do WH", async () => {
    try {
      await vendaEnergia.methods.mudarPrecoWh().send({
        from: accounts[0]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Apenas o concessor pode mudar o preco do WH", async () => {
    try {
      await vendaEnergia.methods.mudarPrecoWh("640").send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Concessor pode receber os fundos do contrato ", async () => {
    await vendaEnergia.methods.comprarEnergia().send({
      from: accounts[2],
      value: web3.utils.toWei("1", "ether")
    });
    const saldoInicial = await web3.eth.getBalance(accounts[0]);
    await vendaEnergia.methods.receberDinheiro().send({
      from: accounts[0]
    });
    const saldoFinal = await web3.eth.getBalance(accounts[0]);
    const diferenca = saldoFinal - saldoInicial;
    assert(diferenca > web3.utils.toWei("0.8", "ether"));
  });

  it("Apenas o concessor pode receber os fundos do contrato", async () => {
    try {
      await vendaEnergia.methods.receberDinheiro().send({
        from: accounts[2]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Permite o concessor logar o consumo", async () => {
    await vendaEnergia.methods.logarConsumo("10000").send({
      from: accounts[0]
    });
  });

  it("Apenas o concessor pode logar o consumo", async () => {
    try {
      await vendaEnergia.methods.logarConsumo("10000").send({
        from: accounts[2]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
  /*


  ///////////
  const energiaComprada = await vendaEnergia.methods
    .getEnergiaComprada()
    .call({
      from: accounts[1]
    });

  assert.equal(630, energiaComprada);
  assert.equal(1, players.length);
  /////////
    it('allows multiple accounts to enter', async () => {
      await vendaEnergia.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.02', 'ether')
      });
      await vendaEnergia.methods.enter().send({
        from: accounts[1],
        value: web3.utils.toWei('0.02', 'ether')
      });
      await vendaEnergia.methods.enter().send({
        from: accounts[2],
        value: web3.utils.toWei('0.02', 'ether')
      });

      const players = await vendaEnergia.methods.getPlayers().call({
        from: accounts[0]
      });

      assert.equal(accounts[0], players[0]);
      assert.equal(accounts[1], players[1]);
      assert.equal(accounts[2], players[2]);
      assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async () => {
      try {
        await vendaEnergia.methods.enter().send({
          from: accounts[0],
          value: 0
        });
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('only manager can call pickWinner', async () => {
      try {
        await vendaEnergia.methods.pickWinner().send({
          from: accounts[1]
        });
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('sends money to the winner and resets the players array', async () => {
      await vendaEnergia.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('2', 'ether')
      });

      const initialBalance = await web3.eth.getBalance(accounts[0]);
      await vendaEnergia.methods.pickWinner().send({ from: accounts[0] });
      const finalBalance = await web3.eth.getBalance(accounts[0]);
      const difference = finalBalance - initialBalance;

      assert(difference > web3.utils.toWei('1.8', 'ether'));
    });

*/
});
