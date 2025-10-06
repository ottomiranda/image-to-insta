#!/usr/bin/env tsx

/**
 * Script de migração para corrigir campanhas com JSON Schema inválido
 * 
 * Este script:
 * 1. Busca todas as campanhas existentes
 * 2. Para cada campanha, executa validateAndNormalizeCampaign()
 * 3. Se result.corrected = true, salva os dados corrigidos nos campos apropriados
 * 4. Atualiza campos: look_items, palette_hex, seo_keywords, brand_tone, governance, telemetry
 * 5. Inclui logs detalhados do processo
 */

import { createClient } from '@supabase/supabase-js';
import { validateAndNormalizeCampaign } from '../src/lib/validateCampaign';
import { Campaign } from '../src/types/campaign';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

// Cliente Supabase com service role para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MigrationStats {
  total: number;
  processed: number;
  corrected: number;
  errors: number;
  skipped: number;
}

async function migrateCampaigns() {
  console.log('🚀 Iniciando migração de campanhas...\n');
  
  const stats: MigrationStats = {
    total: 0,
    processed: 0,
    corrected: 0,
    errors: 0,
    skipped: 0
  };

  try {
    // 1. Buscar todas as campanhas
    console.log('📋 Buscando campanhas...');
    const { data: campaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Erro ao buscar campanhas:', fetchError);
      return;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('ℹ️  Nenhuma campanha encontrada');
      return;
    }

    stats.total = campaigns.length;
    console.log(`✅ Encontradas ${stats.total} campanhas\n`);

    // 2. Processar cada campanha
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i] as Campaign;
      const progress = `[${i + 1}/${stats.total}]`;
      
      console.log(`${progress} Processando: "${campaign.title}" (ID: ${campaign.id})`);

      try {
        // Executar validação e normalização
        const result = await validateAndNormalizeCampaign(campaign);
        
        console.log(`  📊 Validação: ${result.valid ? '✅ Válido' : '❌ Inválido'}`);
        console.log(`  🔧 Correções: ${result.corrected ? '✅ Sim' : '❌ Não'}`);
        
        if (result.errors.length > 0) {
          console.log(`  ⚠️  Erros: ${result.errors.join(', ')}`);
        }
        
        if (result.warnings.length > 0) {
          console.log(`  ⚠️  Avisos: ${result.warnings.join(', ')}`);
        }

        // Se houve correções, salvar no banco
        if (result.corrected && result.correctedData) {
          console.log(`  💾 Salvando correções...`);
          console.log(`  📝 Campos corrigidos: ${result.validationLog.correctedFields.join(', ')}`);

          const updateData = {
            look_items: result.correctedData.look?.items || [],
            palette_hex: result.correctedData.look?.palette_hex || [],
            seo_keywords: result.correctedData.descriptions?.seo_keywords || [],
            brand_tone: result.correctedData.descriptions?.brand_tone || null,
            governance: result.correctedData.governance || {},
            telemetry: result.correctedData.telemetry || {},
            updated_at: new Date().toISOString()
          };

          const { error: updateError } = await supabase
            .from('campaigns')
            .update(updateData)
            .eq('id', campaign.id);

          if (updateError) {
            console.error(`  ❌ Erro ao salvar correções:`, updateError);
            stats.errors++;
          } else {
            console.log(`  ✅ Correções salvas com sucesso`);
            stats.corrected++;
          }
        } else {
          console.log(`  ℹ️  Nenhuma correção necessária`);
          stats.skipped++;
        }

        stats.processed++;
        console.log(`  ⏱️  Tempo de validação: ${result.validationLog.duration_ms}ms\n`);

      } catch (error) {
        console.error(`  ❌ Erro ao processar campanha:`, error);
        stats.errors++;
      }
    }

    // 3. Relatório final
    console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('================================');
    console.log(`Total de campanhas: ${stats.total}`);
    console.log(`Processadas: ${stats.processed}`);
    console.log(`Corrigidas: ${stats.corrected}`);
    console.log(`Sem correção: ${stats.skipped}`);
    console.log(`Erros: ${stats.errors}`);
    console.log(`Taxa de sucesso: ${((stats.processed / stats.total) * 100).toFixed(1)}%`);
    console.log(`Taxa de correção: ${((stats.corrected / stats.total) * 100).toFixed(1)}%`);

    if (stats.corrected > 0) {
      console.log('\n✅ Migração concluída com sucesso!');
      console.log('💡 As campanhas agora devem exibir JSON Schema válido nos indicadores de qualidade.');
    } else {
      console.log('\nℹ️  Migração concluída - nenhuma correção foi necessária.');
    }

  } catch (error) {
    console.error('❌ Erro fatal durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateCampaigns()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { migrateCampaigns };