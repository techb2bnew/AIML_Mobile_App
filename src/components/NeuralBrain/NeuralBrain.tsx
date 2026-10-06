import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import {
  neuralAmber,
  neuralBlue,
  neuralCyan,
  neuralMagenta,
  neuralTeal,
  neuralViolet,
} from '../../constant/Color';
import { AssistantState } from '../../types/conversation';

// The "enterprise neural core" from the desktop app, drawn with plain Views
// so it needs no native graphics library.
//
//   - a glowing core with soft rings and a few orbiting particles
//   - six colour-coded clusters. Each one rides a long spoke that turns slowly
//     around the core (so the clusters wander, like on the web), and has a
//     ringed hub with a cloud of small nodes that twinkle and slowly spin
//   - faint ambient dust everywhere
//
// All geometry is generated once from a seeded generator (identical on every
// launch); all motion is a handful of shared native-driver animations, so the
// UI thread stays cheap.

interface NeuralBrainProps {
  width: number;
  height: number;
  state: AssistantState;
}

interface Node {
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: 0 | 1 | 2;
}
interface Link {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}
interface Cluster {
  color: string;
  radius: number; // spoke length = orbit radius around the core
  startDeg: number;
  orbitSeconds: number; // time for one lap of the core, signed = direction
  spinSeconds: number; // the cluster turning about its own hub
  nodes: Node[]; // relative to the hub
  links: Link[];
}
interface Particle {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

const CLUSTER_COLORS = [neuralMagenta, neuralViolet, neuralTeal, neuralBlue, neuralAmber, neuralCyan];

const makeRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

const buildBrain = (width: number, height: number) => {
  const rand = makeRandom(20260930);
  const cx = width / 2;
  const cy = height / 2;
  const unit = Math.min(width, height);

  const clusters: Cluster[] = CLUSTER_COLORS.map((color, i) => {
    const spread = unit * (0.1 + rand() * 0.07);
    const count = 26 + Math.floor(rand() * 10);
    const nodes: Node[] = [];
    for (let n = 0; n < count; n += 1) {
      const a = rand() * Math.PI * 2;
      // squaring the random bias packs most nodes near the hub, with a few
      // far-flung ones — the same loose cloud as the web version
      const d = rand() * rand() * spread * 1.6 + 6;
      const bright = rand() > 0.8;
      nodes.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        r: bright ? 2.4 + rand() * 1.8 : 0.9 + rand() * 1.4,
        alpha: bright ? 0.95 : 0.4 + rand() * 0.5,
        phase: (n % 3) as 0 | 1 | 2,
      });
    }
    const links: Link[] = [];
    nodes.forEach((node, n) => {
      if (n < 5) {
        links.push({ x1: 0, y1: 0, x2: node.x, y2: node.y, alpha: 0.16 });
      }
      if (n > 1 && rand() > 0.55) {
        const other = nodes[Math.floor(rand() * n)];
        links.push({ x1: node.x, y1: node.y, x2: other.x, y2: other.y, alpha: 0.1 });
      }
    });
    return {
      color,
      radius: unit * (0.27 + rand() * 0.17),
      startDeg: (i / CLUSTER_COLORS.length) * 360 + (rand() - 0.5) * 30,
      orbitSeconds: (i % 2 === 0 ? 1 : -1) * (110 + rand() * 80),
      spinSeconds: (i % 2 === 0 ? -1 : 1) * (60 + rand() * 50),
      nodes,
      links,
    };
  });

  const dust: Node[] = Array.from({ length: 70 }, (_, n) => ({
    x: rand() * width,
    y: rand() * height,
    r: 0.7 + rand() * 1.5,
    alpha: 0.15 + rand() * 0.4,
    phase: (n % 3) as 0 | 1 | 2,
  }));

  const dustLinks: Link[] = [];
  for (let n = 0; n < 14; n += 1) {
    const a = dust[Math.floor(rand() * dust.length)];
    const b = dust[Math.floor(rand() * dust.length)];
    dustLinks.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, alpha: 0.06 });
  }

  // particles circling the core
  const particles: Particle[] = Array.from({ length: 16 }, () => {
    const a = rand() * Math.PI * 2;
    const d = unit * (0.06 + rand() * 0.07);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.8 + rand() * 1.6, alpha: 0.4 + rand() * 0.6 };
  });

  return { cx, cy, unit, clusters, dust, dustLinks, particles };
};

const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const LineView: React.FC<{ link: Link; color: string }> = React.memo(({ link, color }) => {
  const dx = link.x2 - link.x1;
  const dy = link.y2 - link.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (link.x1 + link.x2) / 2 - length / 2,
        top: (link.y1 + link.y2) / 2 - 0.5,
        width: length,
        height: 1,
        backgroundColor: withAlpha(color, link.alpha),
        transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
      }}
    />
  );
});

const NodeView: React.FC<{ node: Node; color: string }> = React.memo(({ node, color }) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: node.x - node.r,
      top: node.y - node.r,
      width: node.r * 2,
      height: node.r * 2,
      borderRadius: node.r,
      backgroundColor: withAlpha(color, node.alpha),
    }}
  />
));

// How the core behaves in each assistant state.
const STATE_MOTION: Record<AssistantState, { period: number; color: string; travel: boolean }> = {
  idle: { period: 3200, color: neuralViolet, travel: false },
  listening: { period: 1100, color: neuralCyan, travel: false },
  processing: { period: 650, color: neuralMagenta, travel: true },
  speaking: { period: 900, color: neuralBlue, travel: true },
  error: { period: 2200, color: '#ef4444', travel: false },
};

const lap = (value: Animated.Value, seconds: number) => {
  const loop = Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration: seconds * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );
  loop.start();
  return loop;
};

const NeuralBrain: React.FC<NeuralBrainProps> = ({ width, height, state }) => {
  const brain = useMemo(() => buildBrain(width, height), [width, height]);

  // Three twinkle phases shared by every node (not one animation per node).
  const twinkle = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const orbits = useRef(CLUSTER_COLORS.map(() => new Animated.Value(0))).current;
  const spins = useRef(CLUSTER_COLORS.map(() => new Animated.Value(0))).current;
  const particleSpin = useRef(new Animated.Value(0)).current;
  const core = useRef(new Animated.Value(0)).current;
  const travel = useRef(new Animated.Value(0)).current;

  // Ambient motion that never changes with state.
  useEffect(() => {
    const loops = [
      ...twinkle.map((value, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 1700 + i * 650,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 1700 + i * 650,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
      ...orbits.map((value, i) => lap(value, Math.abs(brain.clusters[i].orbitSeconds))),
      ...spins.map((value, i) => lap(value, Math.abs(brain.clusters[i].spinSeconds))),
      lap(particleSpin, 26),
    ];
    return () => loops.forEach(l => l.stop());
  }, [twinkle, orbits, spins, particleSpin, brain.clusters]);

  // The core's pulse speed follows the assistant state.
  const motion = STATE_MOTION[state];
  useEffect(() => {
    core.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(core, {
          toValue: 1,
          duration: motion.period / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(core, {
          toValue: 0,
          duration: motion.period / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [core, motion.period]);

  // Signals running from the core out along each spoke while it works.
  useEffect(() => {
    travel.setValue(0);
    if (!motion.travel) {
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(travel, {
        toValue: 1,
        duration: state === 'processing' ? 900 : 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [travel, motion.travel, state]);

  const turn = (value: Animated.Value, startDeg: number, direction: number) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [`${startDeg}deg`, `${startDeg + direction * 360}deg`],
    });

  const coreSize = brain.unit * 0.06;
  const coreScale = core.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const haloScale = core.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const haloOpacity = core.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.12] });

  return (
    <View pointerEvents="none" style={[styles.canvas, { width, height }]}>
      {/* a wide violet wash behind everything, as on the web */}
      <View
        style={{
          position: 'absolute',
          left: brain.cx - width * 0.6,
          top: brain.cy - width * 0.6,
          width: width * 1.2,
          height: width * 1.2,
          borderRadius: width * 0.6,
          backgroundColor: 'rgba(109,60,220,0.06)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: brain.cx - width * 0.35,
          top: brain.cy - width * 0.35,
          width: width * 0.7,
          height: width * 0.7,
          borderRadius: width * 0.35,
          backgroundColor: 'rgba(139,92,246,0.07)',
        }}
      />

      {/* ambient dust + faint lattice */}
      {brain.dustLinks.map((link, i) => (
        <LineView key={`dl${i}`} link={link} color={neuralViolet} />
      ))}
      {[0, 1, 2].map(phase => (
        <Animated.View
          key={`dust${phase}`}
          style={[
            StyleSheet.absoluteFill,
            { opacity: twinkle[phase].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          ]}
        >
          {brain.dust
            .filter(n => n.phase === phase)
            .map((n, i) => (
              <NodeView key={i} node={n} color="#C4B5FD" />
            ))}
        </Animated.View>
      ))}

      {/* each cluster rides a spoke that turns slowly around the core */}
      {brain.clusters.map((c, i) => (
        <Animated.View
          key={`orbit${i}`}
          style={{
            position: 'absolute',
            left: brain.cx,
            top: brain.cy,
            width: 0,
            height: 0,
            transform: [{ rotate: turn(orbits[i], c.startDeg, Math.sign(c.orbitSeconds)) }],
          }}
        >
          {/* the spoke */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: -0.5,
              width: c.radius,
              height: 1,
              backgroundColor: withAlpha(c.color, 0.34),
            }}
          />

          {/* signal dot while the assistant is working */}
          {motion.travel && (
            <Animated.View
              style={{
                position: 'absolute',
                left: -3,
                top: -3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: c.color,
                opacity: travel.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.8, 0] }),
                transform: [
                  { translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [0, c.radius] }) },
                ],
              }}
            />
          )}

          {/* the cluster at the end of the spoke */}
          <View style={{ position: 'absolute', left: c.radius, top: 0, width: 0, height: 0 }}>
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                transform: [{ rotate: turn(spins[i], 0, Math.sign(c.spinSeconds)) }],
              }}
            >
              {c.links.map((l, k) => (
                <LineView key={k} link={l} color={c.color} />
              ))}
              {[0, 1, 2].map(phase => (
                <Animated.View
                  key={phase}
                  style={{
                    opacity: twinkle[phase].interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
                  }}
                >
                  {c.nodes
                    .filter(n => n.phase === phase)
                    .map((n, k) => (
                      <NodeView key={k} node={n} color={c.color} />
                    ))}
                </Animated.View>
              ))}
            </Animated.View>

            {/* ringed hub */}
            <View
              style={{
                position: 'absolute',
                left: -15,
                top: -15,
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: withAlpha(c.color, 0.7),
                backgroundColor: withAlpha(c.color, 0.1),
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: -4,
                top: -4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                shadowColor: c.color,
                shadowOpacity: 1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          </View>
        </Animated.View>
      ))}

      {/* particles circling the core */}
      <Animated.View
        style={{
          position: 'absolute',
          left: brain.cx,
          top: brain.cy,
          width: 0,
          height: 0,
          transform: [{ rotate: turn(particleSpin, 0, -1) }],
        }}
      >
        {brain.particles.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x - p.r,
              top: p.y - p.r,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: p.r,
              backgroundColor: withAlpha('#DDD6FE', p.alpha),
            }}
          />
        ))}
      </Animated.View>

      {/* the core itself */}
      <Animated.View
        style={{
          position: 'absolute',
          left: brain.cx - coreSize * 1.7,
          top: brain.cy - coreSize * 1.7,
          width: coreSize * 3.4,
          height: coreSize * 3.4,
          borderRadius: coreSize * 1.7,
          backgroundColor: withAlpha(motion.color, 0.22),
          opacity: haloOpacity,
          transform: [{ scale: haloScale }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: brain.cx - coreSize * 1.45,
          top: brain.cy - coreSize * 1.45,
          width: coreSize * 2.9,
          height: coreSize * 2.9,
          borderRadius: coreSize * 1.45,
          borderWidth: 1,
          borderColor: withAlpha(motion.color, 0.22),
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: brain.cx - coreSize * 1.05,
          top: brain.cy - coreSize * 1.05,
          width: coreSize * 2.1,
          height: coreSize * 2.1,
          borderRadius: coreSize * 1.05,
          borderWidth: 1,
          borderColor: withAlpha(motion.color, 0.55),
          backgroundColor: withAlpha(motion.color, 0.16),
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: brain.cx - coreSize / 2,
          top: brain.cy - coreSize / 2,
          width: coreSize,
          height: coreSize,
          borderRadius: coreSize / 2,
          backgroundColor: '#F5F3FF',
          shadowColor: motion.color,
          shadowOpacity: 1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
          transform: [{ scale: coreScale }],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default NeuralBrain;
