import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { Timelock } from "../target/types/timelock"
import { expect } from "chai"

describe("timelock", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Timelock as Program<Timelock>
  const creator = provider.wallet as anchor.Wallet

  it("Creates a time lock", async () => {
    const amount = new anchor.BN(1000000000) // 1 SOL
    const unlockTimestamp = new anchor.BN(Date.now() / 1000 + 3600) // 1 hour from now

    const [timelockPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("timelock"), creator.publicKey.toBuffer(), unlockTimestamp.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    const tx = await program.methods
      .initializeLock(amount, unlockTimestamp, null)
      .accounts({
        timelock: timelockPda,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log("Transaction signature:", tx)

    // Fetch the created timelock account
    const timelockAccount = await program.account.timeLock.fetch(timelockPda)

    expect(timelockAccount.creator.toString()).to.equal(creator.publicKey.toString())
    expect(timelockAccount.amount.toString()).to.equal(amount.toString())
    expect(timelockAccount.isWithdrawn).to.be.false
  })

  it("Fails to withdraw before unlock time", async () => {
    const amount = new anchor.BN(1000000000)
    const unlockTimestamp = new anchor.BN(Date.now() / 1000 + 3600) // 1 hour from now

    const [timelockPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("timelock"), creator.publicKey.toBuffer(), unlockTimestamp.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    try {
      await program.methods
        .withdraw()
        .accounts({
          timelock: timelockPda,
          recipient: creator.publicKey,
        })
        .rpc()

      expect.fail("Should have failed")
    } catch (error) {
      expect(error.message).to.include("StillLocked")
    }
  })

  it("Successfully withdraws after unlock time", async () => {
    const amount = new anchor.BN(1000000000)
    const unlockTimestamp = new anchor.BN(Date.now() / 1000 - 1) // 1 second ago

    const [timelockPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("timelock"), creator.publicKey.toBuffer(), unlockTimestamp.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    // Create the timelock
    await program.methods
      .initializeLock(amount, unlockTimestamp, null)
      .accounts({
        timelock: timelockPda,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    // Withdraw from the timelock
    const tx = await program.methods
      .withdraw()
      .accounts({
        timelock: timelockPda,
        recipient: creator.publicKey,
      })
      .rpc()

    console.log("Withdrawal transaction:", tx)

    // Verify withdrawal
    const timelockAccount = await program.account.timeLock.fetch(timelockPda)
    expect(timelockAccount.isWithdrawn).to.be.true
  })
})
