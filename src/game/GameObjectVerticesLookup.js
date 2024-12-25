const GameObjectVerticesLookup = {
    Player: function (size) {
        const heightScale = 0.7; // Scale down the height
        const yOffset = -10; // Move up by 5
        return [
            { x: 0, y: -size * heightScale + yOffset },
            { x: -size / 2, y: size * heightScale + yOffset },
            { x: size / 2, y: size * heightScale + yOffset }
        ];
    },

    Alien: function (size) {
        const heightScale = 0.7; // Scale down the height
        const yOffset = -10; // Move up by 5
        return [
            { x: 0, y: -size * heightScale + yOffset },
            { x: -size / 2, y: size * heightScale + yOffset },
            { x: size / 2, y: size * heightScale + yOffset }
        ];
    },

    AlienMiniBoss: function (size) {
        return [
            { x: 0, y: -size },
            { x: -size / 2, y: 0 },
            { x: -size / 3, y: size / 2 },
            { x: 0, y: size / 3 },
            { x: size / 3, y: size / 2 },
            { x: size / 2, y: 0 }
        ];
    },

    AlienBoss: function (size) {
        return [
            { x: 0, y: -size },
            { x: -size / 2, y: -size / 2 },
            { x: -size / 1.5, y: 0 },
            { x: -size / 2, y: size / 2 },
            { x: 0, y: size / 3 },
            { x: size / 2, y: size / 2 },
            { x: size / 1.5, y: 0 },
            { x: size / 2, y: -size / 2 }
        ];
    },

    AlienRammer: function (size) {
        const heightScale = 0.7; // Scale down the height
        const yOffset = -10; // Move up by 5
        return [
            { x: 0, y: -size * heightScale + yOffset },
            { x: -size / 2, y: size * heightScale + yOffset },
            { x: size / 2, y: size * heightScale + yOffset }
        ];
    },

    AlienStealth: function (size) {
        const heightScale = 0.7; // Scale down the height
        const yOffset = -10; // Move up by 5
        return [
            { x: 0, y: -size * heightScale + yOffset },
            { x: -size / 2, y: size * heightScale + yOffset },
            { x: size / 2, y: size * heightScale + yOffset }
        ];
    }
};
