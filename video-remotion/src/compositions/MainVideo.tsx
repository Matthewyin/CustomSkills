import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Scene1Intro} from '../scenes/Scene1Intro';
import {Scene2Skills} from '../scenes/Scene2Skills';
import {Scene3MCPServer} from '../scenes/Scene3MCPServer';
import {Scene4Demo} from '../scenes/Scene4Demo';
import {Scene5Outro} from '../scenes/Scene5Outro';

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#1a1a2e'}}>
      <Sequence durationInFrames={150}>
        <Scene1Intro />
      </Sequence>

      <Sequence from={150} durationInFrames={210}>
        <Scene2Skills />
      </Sequence>

      <Sequence from={360} durationInFrames={240}>
        <Scene3MCPServer />
      </Sequence>

      <Sequence from={600} durationInFrames={450}>
        <Scene4Demo />
      </Sequence>

      <Sequence from={1050} durationInFrames={150}>
        <Scene5Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
