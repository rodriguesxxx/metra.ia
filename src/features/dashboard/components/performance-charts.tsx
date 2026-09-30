import type { ClassSummary } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";

type Point = { id: string; name: string; grade?: number; attendance?: number };

function RelationshipChart({ points }: { points: Point[] }) {
  const paired = points.filter((point) => Number.isFinite(point.grade) && Number.isFinite(point.attendance));
  if (!paired.length) return null;
  const grades = paired.map((point) => point.grade!);
  const attendance = paired.map((point) => point.attendance!);
  const gradeMin = Math.max(0, Math.floor(Math.min(...grades)) - 1);
  const gradeMax = Math.min(10, Math.ceil(Math.max(...grades)) + 1);
  const attendanceMin = Math.max(0, Math.floor(Math.min(...attendance) / 10) * 10 - 10);
  const attendanceMax = Math.min(100, Math.ceil(Math.max(...attendance) / 10) * 10 + 10);
  const x = (grade: number) => 52 + (grade - gradeMin) / Math.max(1, gradeMax - gradeMin) * 466;
  const y = (value: number) => 238 - (value - attendanceMin) / Math.max(1, attendanceMax - attendanceMin) * 204;
  const gradeTicks = Array.from({ length: gradeMax - gradeMin + 1 }, (_, index) => gradeMin + index);
  const attendanceTicks = Array.from({ length: (attendanceMax - attendanceMin) / 10 + 1 }, (_, index) => attendanceMin + index * 10);
  return <section className="card section performance-chart" aria-label="Relação entre média e frequência">
    <h2>Média × frequência</h2>
    <div className="relationship-plot"><svg viewBox="0 0 560 274" role="img" aria-label="Gráfico de dispersão: média no eixo horizontal e frequência no eixo vertical">
      {attendanceTicks.map((tick) => <g key={tick}><line className="plot-grid" x1="52" x2="518" y1={y(tick)} y2={y(tick)} /><text className="plot-label" x="43" y={y(tick) + 4} textAnchor="end">{tick}%</text></g>)}
      {gradeTicks.map((tick) => <g key={tick}><line className="plot-grid" x1={x(tick)} x2={x(tick)} y1="34" y2="238" /><text className="plot-label" x={x(tick)} y="258" textAnchor="middle">{tick}</text></g>)}
      {paired.map((point, index) => <g key={point.id}><circle className="plot-point" cx={x(point.grade!)} cy={y(point.attendance!)} r="15" /><text className="plot-point-number" x={x(point.grade!)} y={y(point.attendance!) + 4} textAnchor="middle">{index + 1}</text><title>{`${point.name}: média ${formatGrade(point.grade)}, frequência ${formatPercent(point.attendance)}`}</title></g>)}
    </svg></div>
    <div className="plot-legend">{paired.map((point, index) => <span key={point.id}><b>{index + 1}</b>{point.name}</span>)}</div>
  </section>;
}

function RankedChart({ points, unit }: { points: Point[]; unit: string }) {
  const ranked = points.filter((point) => Number.isFinite(point.grade)).sort((a, b) => (b.grade ?? 0) - (a.grade ?? 0));
  if (!ranked.length) return null;
  return <section className="card section performance-chart" aria-label={`Médias por ${unit}`}>
    <h2>Média por {unit}</h2>
    <div className="performance-bars">{ranked.map((point) => <div className="performance-row" key={point.id}>
      <span className="performance-name" title={point.name}>{point.name}</span>
      <span className="performance-track" role="img" aria-label={`${point.name}: média ${formatGrade(point.grade)}`}><span style={{ width: `${Math.max(0, Math.min(100, point.grade! * 10))}%` }} /></span>
      <strong>{formatGrade(point.grade)}</strong>
    </div>)}</div>
    <div className="performance-scale"><span>0</span><span>10</span></div>
  </section>;
}

export function PerformanceCharts({ classes, subjects }: { classes: ClassSummary[]; subjects: Array<{ name: string; averageGrade?: number; attendanceRate?: number }> }) {
  const points: Point[] = classes.length > 1
    ? classes.map((item) => ({ id: item.id, name: item.name, grade: item.averageGrade, attendance: item.attendanceRate }))
    : subjects.map((item) => ({ id: item.name, name: item.name, grade: item.averageGrade, attendance: item.attendanceRate }));
  if (!points.length) return null;
  return <div className="performance-grid"><RelationshipChart points={points} /><RankedChart points={points} unit={classes.length > 1 ? "turma" : "disciplina"} /></div>;
}
