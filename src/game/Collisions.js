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
                } else {
                    gameState.score += 200;
                    spawnXPOrbs(other.body.position.x, other.body.position.y, 30);
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

// Check and handle collisions between asteroids and the player
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
            }
        }
    }
}

// Check and handle collisions between asteroids and projectiles
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
                }
                break; // A single projectile can only hit one asteroid
            }
        }
    }
}

