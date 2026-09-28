export default function Loading() {
  return <div aria-label="Carregando relatório do conselho de classe"><div className="skeleton" style={{ height: 38, width: "32%" }} /><div className="metrics" style={{ marginTop: "1.75rem" }}>{Array.from({ length: 4 }, (_, index) => <div className="card metric" key={index}><div className="skeleton" style={{ height: 18, width: "55%" }} /><div className="skeleton" style={{ height: 30, width: "40%", marginTop: 10 }} /></div>)}</div><div className="card section" style={{ marginTop: "1rem" }}><div className="skeleton" style={{ height: 180 }} /></div></div>;
}
