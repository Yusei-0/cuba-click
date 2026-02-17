export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      provincias: {
        Row: {
          id: string;
          nombre: string;
        };
        Insert: {
          id?: string;
          nombre: string;
        };
        Update: {
          id?: string;
          nombre?: string;
        };
      };
      municipios: {
        Row: {
          id: string;
          provincia_id: string;
          nombre: string;
        };
        Insert: {
          id?: string;
          provincia_id: string;
          nombre: string;
        };
        Update: {
          id?: string;
          provincia_id?: string;
          nombre?: string;
        };
      };
      configuraciones: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      proveedores: {
        Row: {
          id: string;
          nombre: string;
          contacto: string | null;
          activo: boolean;
        };
        Insert: {
          id?: string;
          nombre: string;
          contacto?: string | null;
          activo?: boolean;
        };
        Update: {
          id?: string;
          nombre?: string;
          contacto?: string | null;
          activo?: boolean;
        };
      };
      costos_envio: {
        Row: {
          id: string;
          proveedor_id: string;
          municipio_id: string;
          costo: number;
        };
        Insert: {
          id?: string;
          proveedor_id: string;
          municipio_id: string;
          costo?: number;
        };
        Update: {
          id?: string;
          proveedor_id?: string;
          municipio_id?: string;
          costo?: number;
        };
      };
      categorias: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          icono?: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          slug?: string;
          icono?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          slug?: string;
          icono?: string | null;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          descripcion_corta: string | null;
          precio_costo: number;
          precio_final: number;
          foto_url: string | null;
          garantia_dias: number;
          categoria_id: string | null;
          proveedor_id: string | null;
          activo: boolean;
          created_at: string;
          moneda: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          descripcion_corta?: string | null;
          precio_costo: number;
          precio_final: number;
          foto_url?: string | null;
          garantia_dias?: number;
          categoria_id?: string | null;
          proveedor_id?: string | null;
          activo?: boolean;
          created_at?: string;
          moneda?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          descripcion_corta?: string | null;
          precio_costo?: number;
          precio_final?: number;
          foto_url?: string | null;
          garantia_dias?: number;
          categoria_id?: string | null;
          proveedor_id?: string | null;
          activo?: boolean;
          created_at?: string;
          moneda?: string;
        };
      };
      producto_municipios: {
        Row: {
          producto_id: string;
          municipio_id: string;
        };
        Insert: {
          producto_id: string;
          municipio_id: string;
        };
        Update: {
          producto_id?: string;
          municipio_id?: string;
        };
      };
      monedas: {
        Row: {
          id: string;
          codigo: string;
          simbolo: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          simbolo: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          simbolo?: string;
        };
      };
      metodos_pago: {
        Row: {
          id: string;
          nombre: string;
        };
        Insert: {
          id?: string;
          nombre: string;
        };
        Update: {
          id?: string;
          nombre?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          cliente_nombre: string;
          cliente_telefono: string;
          cliente_ci: string | null;
          municipio_id: string | null;
          direccion_detalle: string;
          moneda_id: string | null;
          metodo_pago_id: string | null;
          proveedor_id: string | null;
          total_productos: number;
          total_envio: number;
          estado: string | null;
          codigo_tracking: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_nombre: string;
          cliente_telefono: string;
          cliente_ci?: string | null;
          municipio_id?: string | null;
          direccion_detalle: string;
          moneda_id?: string | null;
          metodo_pago_id?: string | null;
          proveedor_id?: string | null;
          total_productos?: number;
          total_envio?: number;
          estado?: string | null;
          codigo_tracking?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_nombre?: string;
          cliente_telefono?: string;
          cliente_ci?: string | null;
          municipio_id?: string | null;
          direccion_detalle?: string;
          moneda_id?: string | null;
          metodo_pago_id?: string | null;
          proveedor_id?: string | null;
          total_productos?: number;
          total_envio?: number;
          estado?: string | null;
          codigo_tracking?: string | null;
          created_at?: string;
        };
      };
      detalles_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string | null;
          cantidad: number;
          precio_unitario: number;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id?: string | null;
          cantidad: number;
          precio_unitario: number;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          producto_id?: string | null;
          cantidad?: number;
          precio_unitario?: number;
        };
      };
      proveedor_metodos_pago: {
        Row: {
          id: string;
          proveedor_id: string;
          metodo_pago_id: string;
        };
        Insert: {
          id?: string;
          proveedor_id: string;
          metodo_pago_id: string;
        };
        Update: {
          id?: string;
          proveedor_id?: string;
          metodo_pago_id?: string;
        };
      };
      tasas_cambio: {
        Row: {
          id: string;
          moneda_origen_id: string;
          metodo_pago_origen_id: string;
          moneda_destino_id: string;
          metodo_pago_destino_id: string;
          tasa: number;
          actualizado_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moneda_origen_id: string;
          metodo_pago_origen_id: string;
          moneda_destino_id: string;
          metodo_pago_destino_id: string;
          tasa: number;
          actualizado_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          moneda_origen_id?: string;
          metodo_pago_origen_id?: string;
          moneda_destino_id?: string;
          metodo_pago_destino_id?: string;
          tasa?: number;
          actualizado_en?: string | null;
          created_at?: string;
        };
      };
      proveedor_moneda_metodos_pago: {
        Row: {
          id: string;
          proveedor_id: string;
          moneda: string;
          metodo_pago_id: string;
          tasa_cambio_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proveedor_id: string;
          moneda: string;
          metodo_pago_id: string;
          tasa_cambio_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          proveedor_id?: string;
          moneda?: string;
          metodo_pago_id?: string;
          tasa_cambio_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_: string]: {
        Row: {
          [key: string]: Json;
        };
      };
    };
    Functions: {
      [_: string]: {
        Args: {
          [key: string]: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_: string]: string;
    };
  };
}
