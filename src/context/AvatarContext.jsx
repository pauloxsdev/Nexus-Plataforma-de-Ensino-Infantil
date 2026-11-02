import React from 'react';
import { SUN } from '../theme/tokens';
import { NexusAvatar } from '../components/NexusAvatar';

// O avatar do aluno (o "Nexus"). Fica no App e é lido por qualquer tela com <Me />.
export const AVATAR_PADRAO = { forma: 'orbe', cor: SUN, rosto: 'feliz', acc: 'nenhum' };
export const AvCtx = React.createContext([AVATAR_PADRAO, () => {}]);

export const Me = ({ s = 64, ...extra }) => {
  const [a] = React.useContext(AvCtx);
  return <NexusAvatar s={s} {...a} {...extra} />;
};
