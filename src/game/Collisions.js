function handleProjectileAsteroidCollisions(projectile, gameObjects) {
    for (const other of gameObjects) {
        if (other instanceof Asteroid && projectile.collidingWith(other)) {
            other.takeDamage(50); // Apply damage to the asteroid
            projectile.destroy(); // Mark projectile for destruction

            // Apply repulsion force to the asteroid
            const direction = Matter.Vector.sub(other.body.position, projectile.body.position); // Direction vector
            const normalizedDirection = Matter.Vector.normalise(direction); // Normalize the direction
            const force = Matter.Vector.mult(normalizedDirection, 0.05); // Scale the normalized direction by magnitude
            other.applyRepulsion(force);

            // Add a text effect for asteroid impact
            entities.textEffects.push(new TextEffect({
                x: other.body.position.x,
                y: other.body.position.y,
                text: random(gameState.motivationTexts),
                textColor1: [255, 100, 0],
                textColor2: [255, 150, 0],
                lifetime: 1,
                textMinSize: 12,
                textMaxSize: 20
            }));

            break; // Exit loop since this projectile can only hit one asteroid
        }
    }
}

function handleProjectilePlayerCollisions(projectile, player) {
    if (projectile.collidingWith(player)) {
        player.applyDamage(projectile.damage || 10); // Damage the player
        projectile.destroy(); // Destroy the projectile

        if (player.health <= 0) {
            openDeathMenu(); // Handle player's death
        } else {
            // Add a text effect for player damage
            entities.textEffects.push(new TextEffect({
                x: player.body.position.x,
                y: player.body.position.y - 20,
                text: random(gameState.damageTexts),
                textColor1: [255, 0, 0],
                textColor2: [255, 50, 50],
                lifetime: 1,
                textMinSize: 12,
                textMaxSize: 20
            }));
        }

        // Create a visual impact effect
        const relativeVelocity = Matter.Vector.sub(projectile.body.velocity, player.body.velocity);
        const impactDirection = Matter.Vector.angle(relativeVelocity, { x: 1, y: 0 });

        createBulletImpactDebris({
            position: projectile.body.position,
            direction: degrees(impactDirection),
            spreadAngle: 120,
        });
    }
}

function handleProjectileAlienCollisions(projectile, gameObjects) {
    for (const other of gameObjects) {
        if (other instanceof Alien && projectile.collidingWith(other)) {
            other.takeDamage(projectile.damage || 10); // Damage the alien
            projectile.destroy(); // Mark the projectile for destruction

            if (other.health <= 0) {
                other.destroy(); // Mark alien for destruction

                // Handle mini-boss logic
                if (other instanceof MiniBossAlien) {
                    gameState.score += 1000;
                    spawnXPOrbs(other.body.position.x, other.body.position.y, 300); // Bonus XP

                    // Add a text effect for mini-boss defeat
                    entities.textEffects.push(new TextEffect({
                        x: other.body.position.x,
                        y: other.body.position.y,
                        text: random(gameState.defeatTexts),
                        textColor1: [255, 215, 0],
                        textColor2: [255, 255, 50],
                        lifetime: 2,
                        textMinSize: 20,
                        textMaxSize: 30
                    }));
                } else {
                    gameState.score += 200;
                    spawnXPOrbs(other.body.position.x, other.body.position.y, 30);

                    // Add a text effect for alien defeat
                    entities.textEffects.push(new TextEffect({
                        x: other.body.position.x,
                        y: other.body.position.y,
                        text: random(gameState.defeatTexts),
                        textColor1: [0, 255, 0],
                        textColor2: [50, 255, 50],
                        lifetime: 1,
                        textMinSize: 12,
                        textMaxSize: 20
                    }));
                }
            }

            // Create a visual impact effect
            const relativeVelocity = Matter.Vector.sub(projectile.body.velocity, other.body.velocity);
            const impactDirection = Matter.Vector.angle(relativeVelocity, { x: 1, y: 0 });

            createBulletImpactDebris({
                position: projectile.body.position,
                direction: degrees(impactDirection),
                spreadAngle: 120,
            });

            break; // Exit loop since this projectile can only hit one alien
        }
    }
}

function handleAsteroidPlayerCollisions(asteroids, player) {
    for (const asteroid of asteroids) {
        const collision = Matter.SAT.collides(asteroid.body, player.body);
        if (collision.collided) {
            player.applyDamage(asteroid.damage);
            const repulsionForce = Matter.Vector.normalise(
                Matter.Vector.sub(asteroid.body.position, player.body.position)
            );
            Matter.Body.applyForce(asteroid.body, asteroid.body.position, Matter.Vector.mult(repulsionForce, 0.05));
            asteroid.health -= asteroid.health * 0.3;

            if (asteroid.health <= 0) {
                asteroid.isDestroyed = true;
                player.heal(10);

                // Add a text effect for asteroid destruction
                entities.textEffects.push(new TextEffect({
                    x: player.body.position.x,
                    y: player.body.position.y - 30,
                    text: "+10 HP!",
                    textColor1: [0, 255, 0],
                    textColor2: [50, 255, 50],
                    lifetime: 1,
                    textMinSize: 12,
                    textMaxSize: 20
                }));
            }
        }
    }
}

function handleAsteroidProjectileCollisions(asteroids, projectiles) {
    for (const asteroid of asteroids) {
        for (const projectile of projectiles) {
            const collision = Matter.SAT.collides(asteroid.body, projectile.body);
            if (collision.collided) {
                asteroid.health -= projectile.damage;
                const impactForce = Matter.Vector.normalise(
                    Matter.Vector.sub(asteroid.body.position, projectile.body.position)
                );
                Matter.Body.applyForce(asteroid.body, asteroid.body.position, Matter.Vector.mult(impactForce, 0.1));
                projectile.destroy();

                if (asteroid.health <= 0) {
                    asteroid.isDestroyed = true;

                    // Add a text effect for asteroid destruction
                    entities.textEffects.push(new TextEffect({
                        x: asteroid.body.position.x,
                        y: asteroid.body.position.y,
                        text: random(gameState.motivationTexts),
                        textColor1: [255, 255, 255],
                        textColor2: [200, 200, 200],
                        lifetime: 1,
                        textMinSize: 12,
                        textMaxSize: 20
                    }));
                }
                break; // A single projectile can only hit one asteroid
            }
        }
    }
}
