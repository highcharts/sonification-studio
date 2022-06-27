
export function speedToDuration(speed: number): number {
    return Math.round(1 / Math.pow(speed, 0.4 * speed / 100 + 0.4) * 320000 - 6000);
}
