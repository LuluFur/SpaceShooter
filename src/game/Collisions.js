// Standardize collision checks
function handleProjectileAsteroidCollisions(projectiles, asteroids) {
    for (const projectile of projectiles) {
        for (const asteroid of asteroids) {
            if (projectile.collidingWith(asteroid)) {
                asteroid.takeDamage(projectile.damage || 50);
                projectile.destroy();

                // Apply repulsion force to the asteroid
                const direction = Matter.Vector.sub(asteroid.body.position, projectile.body.position);
                const normalizedDirection = Matter.Vector.normalise(direction);
                const force = Matter.Vector.mult(normalizedDirection, 0.05);
                Matter.Body.applyForce(asteroid.body, asteroid.body.position, force);

                // Create motivational text effect
                const text = random(gameState.motivationTexts);
                entities.textEffects.push(new TextEffect({
                    x: asteroid.body.position.x,
                    y: asteroid.body.position.y,
                    text: text,
                    textMinSize: 12,
                    textMaxSize: 24,
                    textColor1: [255, 255, 0],
                    textColor2: [255, 100, 0],
                    lifetime: 1
                }));
                break;
            }
        }
    }
}

function handleProjectilePlayerCollisions(projectiles, player) {
    for (const projectile of projectiles) {
        if (projectile.collidingWith(player)) {
            if (projectile.player == player) { return; }
            player.applyDamage(projectile.damage || 10);
            projectile.destroy();

            if (player.health <= 0) {
                openDeathMenu();
            }

            // Create a visual impact effect
            const relativeVelocity = Matter.Vector.sub(projectile.body.velocity, player.body.velocity);
            const impactDirection = Matter.Vector.angle(relativeVelocity, { x: 1, y: 0 });

            createBulletImpactDebris({
                position: projectile.body.position,
                direction: degrees(impactDirection),
                spreadAngle: 120,
            });

            // Create damage text effect
            entities.textEffects.push(new TextEffect({
                x: player.body.position.x,
                y: player.body.position.y - 20,
                text: `-${projectile.damage || 10}`,
                textMinSize: 16,
                textMaxSize: 28,
                textColor1: [255, 0, 0],
                textColor2: [255, 50, 50],
                lifetime: 1
            }));
        }
    }
}

function handleProjectileAlienCollisions(projectiles, aliens) {
    for (const projectile of projectiles) {
        for (const alien of aliens) {
            if (projectile.collidingWith(alien)) {
                alien.takeDamage(projectile.damage || 10);
                projectile.destroy();

                if (alien.health <= 0) {
                    alien.destroy();

                    // Handle mini-boss logic
                    if (alien instanceof MiniBossAlien) {
                        gameState.score += 1000;
                        spawnXPOrbs(alien.body.position.x, alien.body.position.y, 300);
                    } else {
                        gameState.score += 200;
                        spawnXPOrbs(alien.body.position.x, alien.body.position.y, 30);
                    }

                    // Create motivational text effect
                    const text = random(gameState.motivationTexts);
                    entities.textEffects.push(new TextEffect({
                        x: alien.body.position.x,
                        y: alien.body.position.y,
                        text: text,
                        textMinSize: 12,
                        textMaxSize: 24,
                        textColor1: [0, 255, 0],
                        textColor2: [100, 255, 100],
                        lifetime: 1
                    }));
                }

                // Create a visual impact effect
                const relativeVelocity = Matter.Vector.sub(projectile.body.velocity, alien.body.velocity);
                const impactDirection = Matter.Vector.angle(relativeVelocity, { x: 1, y: 0 });

                createBulletImpactDebris({
                    position: projectile.body.position,
                    direction: degrees(impactDirection),
                    spreadAngle: 120,
                });

                break;
            }
        }
    }
}

function handleAsteroidPlayerCollisions(asteroids, player) {
    for (const asteroid of asteroids) {
        if (Matter.SAT.collides(asteroid.body, player.body).collided) {
            player.applyDamage(asteroid.damage);

            const repulsionForce = Matter.Vector.normalise(
                Matter.Vector.sub(asteroid.body.position, player.body.position)
            );

            Matter.Body.applyForce(
                asteroid.body,
                asteroid.body.position,
                Matter.Vector.mult(repulsionForce, 0.05)
            );

            asteroid.health -= asteroid.health * 0.3;
            if (asteroid.health <= 0) {
                asteroid.isDestroyed = true;
                player.heal(10);

                // Create healing text effect
                entities.textEffects.push(new TextEffect({
                    x: player.body.position.x,
                    y: player.body.position.y - 30,
                    text: "+10",
                    textMinSize: 16,
                    textMaxSize: 28,
                    textColor1: [0, 255, 0],
                    textColor2: [50, 255, 50],
                    lifetime: 1
                }));
            }
        }
    }
}

function handleAsteroidProjectileCollisions(asteroids, projectiles) {
    for (const asteroid of asteroids) {
        for (const projectile of projectiles) {
            if (Matter.SAT.collides(asteroid.body, projectile.body).collided) {
                asteroid.health -= projectile.damage || 50;

                const impactForce = Matter.Vector.normalise(
                    Matter.Vector.sub(asteroid.body.position, projectile.body.position)
                );

                Matter.Body.applyForce(
                    asteroid.body,
                    asteroid.body.position,
                    Matter.Vector.mult(impactForce, 0.1)
                );

                projectile.destroy();

                if (asteroid.health <= 0) {
                    asteroid.isDestroyed = true;
                }

                break;
            }
        }
    }
}

function handleAlienAlienCollisions(aliens) {
    for (let i = 0; i < aliens.length; i++) {
        for (let j = i + 1; j < aliens.length; j++) {
            const alienA = aliens[i];
            const alienB = aliens[j];

            if (Matter.SAT.collides(alienA.body, alienB.body).collided) {
                const repulsionForce = Matter.Vector.normalise(
                    Matter.Vector.sub(alienA.body.position, alienB.body.position)
                );

                Matter.Body.applyForce(
                    alienA.body,
                    alienA.body.position,
                    Matter.Vector.mult(repulsionForce, 0.02)
                );

                Matter.Body.applyForce(
                    alienB.body,
                    alienB.body.position,
                    Matter.Vector.mult(repulsionForce, -0.02)
                );
            }
        }
    }
}

function handleAsteroidAsteroidCollisions(asteroids) {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            const asteroidA = asteroids[i];
            const asteroidB = asteroids[j];

            if (Matter.SAT.collides(asteroidA.body, asteroidB.body).collided) {
                const repulsionForce = Matter.Vector.normalise(
                    Matter.Vector.sub(asteroidA.body.position, asteroidB.body.position)
                );

                Matter.Body.applyForce(
                    asteroidA.body,
                    asteroidA.body.position,
                    Matter.Vector.mult(repulsionForce, 0.03)
                );

                Matter.Body.applyForce(
                    asteroidB.body,
                    asteroidB.body.position,
                    Matter.Vector.mult(repulsionForce, -0.03)
                );
            }
        }
    }
}

function handleAsteroidAlienCollisions(asteroids, aliens) {
    for (const asteroid of asteroids) {
        for (const alien of aliens) {
            if (Matter.SAT.collides(asteroid.body, alien.body).collided) {
                // Repulsion effect
                const repulsionForce = Matter.Vector.normalise(
                    Matter.Vector.sub(asteroid.body.position, alien.body.position)
                );

                Matter.Body.applyForce(
                    asteroid.body,
                    asteroid.body.position,
                    Matter.Vector.mult(repulsionForce, 0.03)
                );

                Matter.Body.applyForce(
                    alien.body,
                    alien.body.position,
                    Matter.Vector.mult(repulsionForce, -0.03)
                );
            }
        }
    }
}