// /components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-6 bg-black text-center">
      {/* Linha visual no topo do footer */}
              <Image src="/images/twolines.png" alt="" className="w-full h-3 object-cover select-none pointer-events-none mb-4" draggable="false" width={400} height={12} style={{ height: 'auto' }} />
      {/* Frase Suor + Tecnologia + Linha lado a lado */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4 mt-8 w-full">
                  <Image src="/images/twolines.png" alt="" className="h-10 md:h-12 max-w-[120px] object-contain select-none pointer-events-none" draggable="false" width={120} height={48} style={{ height: 'auto' }} />
        <p className="text-lg md:text-2xl font-semibold text-gray-500 font-tech text-center md:text-left leading-tight">
          Suor + Tecnologia.<br/>
          <span className="text-white">O cerrado vai virar arena novamente.</span>
        </p>
      </div>
      {/* Linha visual compondo com o texto */}
              <Image src="/images/twolines.png" alt="" className="w-full h-3 object-cover select-none pointer-events-none my-4" draggable="false" width={400} height={12} style={{ height: 'auto' }} />
      {/* Footer */}
      <div className="mt-32 text-sm border-t border-neutral-800 pt-6 w-full text-center">
        <p className="text-white">
          © {new Date().getFullYear()} CERRADØ INTERBØX. Todos os direitos reservados.
        </p>
        <p className="mt-1 italic text-neutral-500">
          Desenvolvido por Protocolo <span className="text-pink-500">NEØ / MELLØ</span>
        </p>
        <div className="mt-4 space-x-4">
          <Link 
            href="/admin" 
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Admin
          </Link>
          <span className="text-gray-600">•</span>
          <Link 
            href="/politica-privacidade" 
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Política de Privacidade
          </Link>
          <span className="text-gray-600">•</span>
          <Link 
            href="/termos-uso" 
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Termos de Uso
          </Link>
        </div>
      </div>
    </footer>
  );
}
  