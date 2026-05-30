import { ProjectMark } from './ProjectMark';

export function TemplateMark({
  mark,
  color,
  size = 36,
}: {
  mark: string;
  color: string;
  size?: number;
}) {
  return <ProjectMark mark={mark} color={color} size={size} />;
}
