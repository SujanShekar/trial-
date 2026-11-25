import React from 'react';

export type ResponsiveTableCard = {
  id: string;
  title: React.ReactNode;
  details: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
};

/** Keeps a semantic desktop table while providing a consistently tappable card view below md. */
export const ResponsiveTable: React.FC<{ children: React.ReactNode; cards: ResponsiveTableCard[] }> = ({ children, cards }) => (
  <>
    <div className="hidden overflow-x-auto md:block">{children}</div>
    <div className="space-y-3 md:hidden">
      {cards.map((card) => <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-black text-slate-800">{card.title}</h3>
        <dl className="mt-3 space-y-2 text-sm">{card.details.slice(0, 4).map(detail => <div key={detail.label}><dt className="text-[10px] font-black uppercase tracking-wider text-slate-400">{detail.label}</dt><dd className="font-medium text-slate-700">{detail.value}</dd></div>)}</dl>
        {card.actions && <div className="mt-4 flex min-h-11 flex-wrap items-center gap-2 border-t border-slate-100 pt-3">{card.actions}</div>}
      </article>)}
    </div>
  </>
);
