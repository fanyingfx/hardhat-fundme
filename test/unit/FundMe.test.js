const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              // deploy FundMe contract
              // const accounts = await ethers.getSigners()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
              describe("withdraw", async () => {
                  beforeEach(async () => {
                      await fundMe.fund({ value: sendValue })
                  })
                  it("withdraw ETH from a single founder", async () => {
                      // Arrange
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Act
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMebalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Assert
                      assert.equal(endingFundMebalance, 0)
                      assert.equal(
                          startingFundMeBalance
                              .add(startingDeployerBalance)
                              .toString(),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                  })

                  it("Allow us to withdraw with multiple funders", async () => {
                      const accounts = await ethers.getSigners()
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnectedContract.fund({
                              value: sendValue,
                          })
                      }

                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMebalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      assert.equal(endingFundMebalance, 0)
                      assert.equal(
                          startingFundMeBalance
                              .add(startingDeployerBalance)
                              .toString(),
                          endingDeployerBalance.add(gasCost).toString()
                      )

                      await expect(fundMe.s_funders(0)).to.be.reverted
                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.s_addressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })

                  it("Fails if you are not owner", async () => {
                      const accounts = await ethers.getSigners()
                      const attrackerConnectedContract = await fundMe.connect(
                          accounts[1]
                      )
                      await expect(
                          attrackerConnectedContract.withdraw()
                      ).to.be.revertedWithCustomError(
                          attrackerConnectedContract,
                          "FundMe__NotOwner"
                      )
                  })
              })

              describe("Cheapwithdraw", async () => {
                  beforeEach(async () => {
                      await fundMe.fund({ value: sendValue })
                  })
                  it("withdraw ETH from a single founder", async () => {
                      // Arrange
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Act
                      const transactionResponse = await fundMe.cheapWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMebalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Assert
                      assert.equal(endingFundMebalance, 0)
                      assert.equal(
                          startingFundMeBalance
                              .add(startingDeployerBalance)
                              .toString(),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                  })

                  it("Allow us to withdraw with multiple funders", async () => {
                      const accounts = await ethers.getSigners()
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnectedContract.fund({
                              value: sendValue,
                          })
                      }

                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)
                      const transactionResponse = await fundMe.cheapWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMebalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      assert.equal(endingFundMebalance, 0)
                      assert.equal(
                          startingFundMeBalance
                              .add(startingDeployerBalance)
                              .toString(),
                          endingDeployerBalance.add(gasCost).toString()
                      )

                      await expect(fundMe.s_funders(0)).to.be.reverted
                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.s_addressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })

                  it("Fails if you are not owner", async () => {
                      const accounts = await ethers.getSigners()
                      const attrackerConnectedContract = await fundMe.connect(
                          accounts[1]
                      )
                      await expect(
                          attrackerConnectedContract.cheapWithdraw()
                      ).to.be.revertedWithCustomError(
                          attrackerConnectedContract,
                          "FundMe__NotOwner"
                      )
                  })
              })
          })
      })
