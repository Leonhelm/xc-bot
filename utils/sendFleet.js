

export async function sendFleetTimeout() {
    await new Promise((r) => setTimeout(r, 10_000));
}
