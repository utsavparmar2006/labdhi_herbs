import mongoose, { ClientSession } from 'mongoose';

/**
 * Execute an operation inside a MongoDB ACID transaction.
 * Automatically handles replica set vs standalone fallback so production Atlas gets full
 * ACID guarantees while local environments continue without crash.
 */
export async function withTransaction<T>(
  operation: (session?: ClientSession) => Promise<T>
): Promise<T> {
  let session: ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    let result: T;

    try {
      await session.withTransaction(async () => {
        result = await operation(session!);
      });
      return result!;
    } catch (txErr: any) {
      // If transactions are not supported on this mongo deployment (e.g. standalone local mongo)
      const isNotReplicaSet =
        txErr?.message?.includes('replica set') ||
        txErr?.message?.includes('Transaction numbers are only allowed') ||
        txErr?.code === 20;

      if (isNotReplicaSet) {
        console.warn(
          '[Transaction Warning] MongoDB deployment does not support replica set transactions. Falling back to non-transactional execution.'
        );
        return await operation(undefined);
      }
      throw txErr;
    }
  } catch (sessionErr: any) {
    // If starting a session itself fails
    console.warn('[Session Warning] Could not start mongoose session, executing directly:', sessionErr.message);
    return await operation(undefined);
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (e) {
        // Silently close session
      }
    }
  }
}
