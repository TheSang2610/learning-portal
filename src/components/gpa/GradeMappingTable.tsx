import { rangeOf, type Scale } from "./gradeScales";

// Bang quy doi dung chung cho trang Tinh diem tong ket va trang Quy doi 10 -> 4.
// Sinh tu gradeScales.ts nen khong bao gio lech voi ket qua tinh that.

export default function GradeMappingTable({ scale }: { scale: Scale }) {
  return (
    <div className="overflow-hidden rounded-lg border border-blue-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-2 py-2 font-bold">Điểm hệ 10</th>
            <th className="px-2 py-2 font-bold">Điểm hệ 4</th>
            <th className="px-2 py-2 font-bold">Điểm dạng chữ</th>
          </tr>
        </thead>
        <tbody>
          {/* Bang goc liet ke tu thap len cao, mang grades sap giam dan */}
          {scale.grades
            .map((g, i) => ({ g, i }))
            .reverse()
            .map(({ g, i }) => (
              <tr key={g.letter} className="border-t border-blue-200">
                <td className="px-2 py-2 text-slate-700">{rangeOf(scale, i)}</td>
                <td className="px-2 py-2 text-slate-700">{g.gpa4}</td>
                <td className="px-2 py-2 font-bold text-slate-900">{g.letter}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
